import { clearCartForUser } from "../controllers/cart.controllers";
import { db } from "../drizzle/db";
import {
  checkoutSession,
  orderItems,
  orders,
  PaymentProvider,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

type PaidLookup = { providerOrderId?: string; providerCheckoutId?: string };

export const alreadyPaid = async (
  provider: PaymentProvider,
  ids: PaidLookup,
) => {
  if (ids.providerOrderId) {
    const [row] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(
        and(
          eq(orders.paymentProvider, provider),
          eq(orders.providerOrderId, ids.providerOrderId),
        ),
      )
      .limit(1);
    if (row?.status === "paid") return true;
  }
  if (ids.providerCheckoutId) {
    const [row] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(
        and(
          eq(orders.paymentProvider, provider),
          eq(orders.providerCheckoutId, ids.providerCheckoutId),
        ),
      )
      .limit(1);
    if (row?.status === "paid") return true;
  }
  return false;
};

type FulfillInput = {
  provider: PaymentProvider;
  sessionId: string;
  providerOrderId?: string;
  providerCheckoutId?: string;
  providerReference?: Record<string, unknown>;
};

// Turns a checkout session into a paid order, exactly once. Returns true only for the call that created the order; false means where was no matching session (already fulfilled, or never existed). The row lock plus deleting the session inside the same transaction makes concurrent calls (webhook + poller) safe.
export const fulfillCheckoutSession = async (input: FulfillInput) => {
  const {
    provider,
    sessionId,
    providerOrderId,
    providerCheckoutId,
    providerReference,
  } = input;

  const fulfilledForUserId = await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(checkoutSession)
      .where(eq(checkoutSession.id, sessionId))
      .for("update");
    // A Polar notification must never fulfill a QR session or vice versa
    if (!session || session.paymentProvider !== provider) return null;

    const [order] = await tx
      .insert(orders)
      .values({
        userId: session.userId,
        status: "paid",
        paymentProvider: provider,
        currency: session.currency,
        totalCents: session.totalCents,
        providerCheckoutId:
          providerCheckoutId ?? session.providerCheckoutId ?? null,
        ...(providerOrderId ? { providerOrderId } : {}),
        ...(providerReference ? { providerReference } : {}),
      })
      .returning();

    if (session.lines.length) {
      await tx.insert(orderItems).values(
        session.lines.map((line) => {
          return {
            orderId: order.id,
            productId: line.productId,
            quantity: line.quantity,
            unitPriceCents: line.unitPriceCents,
          };
        }),
      );
    }
    await tx.delete(checkoutSession).where(eq(checkoutSession.id, sessionId));
    return session.userId;
  });

  if (fulfilledForUserId) {
    //  Best effort: the order is already commited, a stale cart is smaller problem than a failed fulfillment
    try {
      await clearCartForUser(fulfilledForUserId);
    } catch (err) {
      console.error("Failed to clear cart after order fulfillment", err);
    }
  }
  return fulfilledForUserId !== null;
};

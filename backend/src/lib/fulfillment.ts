import { eq, and, gte, sql } from "drizzle-orm";
import {
  checkoutSession,
  orderItems,
  orders,
  PaymentProvider,
  products,
} from "../drizzle/schema";
import { clearCartForUser } from "../controllers/cart.controllers";
import { db } from "../drizzle/db";
import { sendOrderConfirmedEmail } from "./order-emails";

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

  const result = await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(checkoutSession)
      .where(eq(checkoutSession.id, sessionId))
      .for("update");
    // a Polar notification must never fulfill a QR session or vice versa
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
        // the address snapshot
        shipFullName: session.shipFullName,
        shipPhone: session.shipPhone,
        shipCity: session.shipCity,
        shipZone: session.shipZone,
        shipStreet: session.shipStreet,
        shipReference: session.shipReference,
        shipLatitude: session.shipLatitude,
        shipLongitude: session.shipLongitude,
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

    // Atomic decrement. Lines are sorted so two orders always lock rows in the same order
    const oversold: string[] = [];
    const sortedLines = [...session.lines].sort((a, b) => {
      return a.productId.localeCompare(b.productId);
    });
    for (const line of sortedLines) {
      const decrement = await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${line.quantity}` })
        .where(
          and(
            eq(products.id, line.productId),
            gte(products.stock, line.quantity),
          ),
        )
        .returning({ id: products.id });
      if (decrement.length === 0) {
        // already paid, so we can't reject the order: clamp to 0 and flag it
        oversold.push(line.productId);
        await tx
          .update(products)
          .set({ stock: 0 })
          .where(eq(products.id, line.productId));
      }
    }
    await tx.delete(checkoutSession).where(eq(checkoutSession.id, sessionId));
    return { userId: session.userId, orderId: order.id, oversold: oversold };
  });
  if (!result) return false;

  if (result.oversold.length > 0) {
    console.error(
      `OVERSOLD: order ${result.orderId} has products without enough stock: ${result.oversold}`,
    );
  }

  // not awaited: an email problem must never fail the fulfillment
  void sendOrderConfirmedEmail(result.orderId);

  // best effort: the order is already commited
  try {
    await clearCartForUser(result.userId);
  } catch (err) {
    console.error("Failed to clear cart after order fulfillment", err);
  }
  return true;
};

/* export const fulfillCheckoutSession = async (input: FulfillInput) => {
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
}; */

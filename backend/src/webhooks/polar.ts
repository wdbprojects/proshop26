import { Request, Response } from "express";
import { getEnv } from "../config/env";
import { checkoutSession, orderItems, orders } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { db } from "../drizzle/db";
import { Webhook } from "standardwebhooks";
import { clearCartForUser } from "../controllers/cart.controllers";

/* This file stays Polar-specific (signature verification, event shape, Polar's field names). The provider-agnostic part - "given a checkout session id and a provider order/checkout id, create the order and clear the cart" - lives in fullfillCheckoutSession below and only needs the literal PROVIDER swapped for a future provider's own webhook handler to reuse the same shape */
const PROVIDER = "polar" as const;

const headerString = (headers: Request["headers"], name: string) => {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
};

const alreadyPaid = async (
  providerOrderId?: string,
  providerCheckoutId?: string,
) => {
  if (providerOrderId) {
    const [row] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.paymentProvider, PROVIDER),
          eq(orders.providerOrderId, providerOrderId),
        ),
      )
      .limit(1);
    if (row?.status === "paid") return true;
  }
  if (providerCheckoutId) {
    const [row] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.paymentProvider, PROVIDER),
          eq(orders.providerCheckoutId, providerCheckoutId),
        ),
      )
      .limit(1);
    if (row?.status === "paid") return true;
  }
  return false;
};

const checkoutSessionIdFromMetadata = async (
  order: Record<string, unknown>,
) => {
  const metadata = order.metadata;
  if (!metadata || typeof metadata !== "object") return undefined;
  const sessionId = (metadata as Record<string, unknown>).checkout_session_id;
  return typeof sessionId === "string" ? sessionId : undefined;
};

const fulfillCheckoutSession = async (
  sessionId: string,
  providerOrderId: string | undefined,
  providerCheckoutId: string | undefined,
) => {
  // database transaction - returns the userId to clear the cart for on success, or null if there was no matching session to fulfill
  const fulfilledForUserId = await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(checkoutSession)
      .where(eq(checkoutSession.id, sessionId))
      .for("update");
    if (!session) return null;

    const [orderResp] = await tx
      .insert(orders)
      .values({
        userId: session.userId,
        status: "paid",
        paymentProvider: PROVIDER,
        totalCents: session.totalCents,
        providerCheckoutId:
          providerCheckoutId ?? session.providerCheckoutId ?? null,
        ...(providerOrderId ? { providerOrderId } : {}),
      })
      .returning();

    if (session.lines.length) {
      await tx.insert(orderItems).values(
        session.lines.map((line) => ({
          orderId: orderResp.id,
          productId: line.productId,
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
        })),
      );
    }
    await tx.delete(checkoutSession).where(eq(checkoutSession.id, sessionId));
    return session.userId;
  });

  if (fulfilledForUserId) {
    /* Best-effort: the order is already paid and committed at this point, so a failure here should never look like a failed webhook (Polar would retry and we would double-process). Just log it - the customer's cart being briefly stale is a much smaller problem than that. */
    try {
      await clearCartForUser(fulfilledForUserId);
    } catch (err) {
      console.error("Failed to clear cart after order fullfillment", err);
    }
  }
  return fulfilledForUserId !== null;
};

export const polarWebhookHandler = async (req: Request, res: Response) => {
  const env = getEnv();
  try {
    if (!env.POLAR_WEBHOOK_SECRET) {
      res.status(503).send("Polar webhooks not configured!!");
      return;
    }

    const raw =
      req.body instanceof Buffer ? req.body : Buffer.from(String(req.body));
    const wh = new Webhook(
      Buffer.from(env.POLAR_WEBHOOK_SECRET, "utf-8").toString("base64"),
    );

    const id = headerString(req.headers, "webhook-id");
    const ts = headerString(req.headers, "webhook-timestamp");
    const sig = headerString(req.headers, "webhook-signature");

    if (!id || !ts || !sig) {
      res.status(400).json({ error: "Missing webhook headers" });
      return;
    }

    wh.verify(raw, {
      "webhook-id": id,
      "webhook-timestamp": ts,
      "webhook-signature": sig,
    });

    const event = JSON.parse(raw.toString("utf-8")) as {
      type: string;
      data?: Record<string, unknown>;
    };

    if (event.type === "order.paid" && event.data) {
      const data = event.data;
      const polarOrderId = typeof data.id === "string" ? data.id : undefined;
      const checkoutId =
        typeof data.checkout_id === "string" ? data.checkout_id : undefined;

      if (await alreadyPaid(polarOrderId, checkoutId)) {
        res.json({ ok: true, duplicate: true });
        return;
      }

      const sessionId = await checkoutSessionIdFromMetadata(data);

      if (sessionId) {
        const ok = await fulfillCheckoutSession(
          sessionId,
          polarOrderId,
          checkoutId,
        );
        if (ok) {
          res.json({ ok: true });
          return;
        }
        if (await alreadyPaid(polarOrderId, checkoutId)) {
          res.json({ ok: true, duplicate: true });
          return;
        }
        console.error("Polar order.paid: could not fulfill checkout session", {
          sessionId,
          checkoutId,
        });
        res.status(500).json({ error: "Checkout fulfillment failed" });
      }
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Polar webhook error", err);
    res.status(400).json({ error: "Invalid webhook" });
  }
};

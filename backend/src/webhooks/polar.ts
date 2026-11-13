import { Request, Response } from "express";
import { getEnv } from "../config/env";
import { Webhook } from "standardwebhooks";
import { alreadyPaid, fulfillCheckoutSession } from "../lib/fulfillment";

const PROVIDER = "polar" as const;

const headerString = (headers: Request["headers"], name: string) => {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
};

const checkoutSessionIdFromMetadata = (order: Record<string, unknown>) => {
  const metadata = order.metadata;
  if (!metadata || typeof metadata !== "object") return undefined;
  const sessionId = (metadata as Record<string, unknown>).checkout_session_id;
  return typeof sessionId === "string" ? sessionId : undefined;
};

export const polarWebhookHandler = async (req: Request, res: Response) => {
  const env = getEnv();
  try {
    if (!env.POLAR_WEBHOOK_SECRET) {
      res.status(503).send("Polar webhooks not configured");
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
      const ids = {
        providerOrderId: typeof data.id === "string" ? data.id : undefined,
        providerCheckoutId:
          typeof data.checkout_id === "string" ? data.checkout_id : undefined,
      };
      if (await alreadyPaid(PROVIDER, ids)) {
        res.json({ ok: true, duplicate: true });
        return;
      }

      const sessionId = checkoutSessionIdFromMetadata(data);
      if (sessionId) {
        const ok = await fulfillCheckoutSession({
          provider: PROVIDER,
          sessionId: sessionId,
          ...ids,
        });
        if (ok) {
          res.json({ ok: true });
          return;
        }
        if (await alreadyPaid(PROVIDER, ids)) {
          res.json({ ok: true, duplicate: true });
          return;
        }
        console.error("Polar order.paid: could not fulfill checkout session", {
          sessionId: sessionId,
          checkoutId: ids.providerCheckoutId,
        });
        res.status(500).json({ error: "Checkout fulfillment failed" });
        return;
      }
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Polar webhook error", err);
    res.status(400).json({ error: "Invalid webhook" });
  }
};

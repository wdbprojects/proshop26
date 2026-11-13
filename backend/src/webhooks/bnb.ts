import { timingSafeEqual } from "node:crypto";
import { getEnv } from "../config/env";
import { Request, Response } from "express";
import z from "zod";
import { BnbNotification, confirmQrPayment } from "../lib/bnb-payments";

const ENV = getEnv();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

// API key or Basic Auth: configure the header name and the exact expected value in env. No value configured = no check (the bank's status endpoint is still the real authority)
const isAuthorized = (req: Request) => {
  if (!ENV.BNB_WWBHOOK_AUTH_VALUE) return true;
  const received = req.headers[ENV.BNB_WEBHOOOK_AUTH_HEADER.toLowerCase()];
  const value = Array.isArray(received) ? received[0] : received;
  return (
    typeof value === "string" && safeEqual(value, ENV.BNB_WWBHOOK_AUTH_VALUE)
  );
};

// The PDF mixes casing (QRId, sourceBankId...) so normalize keys first
const lowercaseKeys = (body: unknown) => {
  if (!body || typeof body !== "object") return {};
  return Object.fromEntries(
    Object.entries(body as Record<string, unknown>).map(([key, value]) => {
      return [key.toLowerCase(), value];
    }),
  );
};

const notificationSchema = z.object({
  qrid: z.union([z.string(), z.number()]),
  voucherid: z.string().nullable().optional(),
  originname: z.string().nullable().optional(),
  sourcebankid: z.union([z.number(), z.string()]).nullable().optional(),
  transactiondatetime: z.string().nullable().optional(),
  amount: z.union([z.number(), z.string()]).optional(),
});

// POST /webhook/bnb/RecevieNotification (the path MUST end in /ReceiveNotification)
export const bnbNotificationHandler = async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const parsed = notificationSchema.safeParse(lowercaseKeys(req.body));
  const qrId = parsed.success ? String(parsed.data.qrid).trim() : "";
  if (!parsed.success || !/^\d+$/.test(qrId)) {
    res.status(400).json({ success: false, message: "Invalid notification" });
    return;
  }

  const amount =
    parsed.data.amount !== undefined ? Number(parsed.data.amount) : NaN;
  const sourceBankId =
    parsed.data.sourcebankid !== null ? Number(parsed.data.sourcebankid) : NaN;

  const notification: BnbNotification = {
    amountCents: Number.isFinite(amount) ? Math.round(amount * 100) : undefined,
    voucherId: parsed.data.voucherid?.trim() || undefined,
    originName: parsed.data.originname ?? undefined,
    sourceBankId: Number.isFinite(sourceBankId) ? sourceBankId : undefined,
    transactionDateTime: parsed.data.transactiondatetime ?? undefined,
  };

  try {
    let result = await confirmQrPayment(qrId, notification);

    // The status endpoint may lag a moment behind the notification
    for (
      let attempt = 0;
      attempt < 2 && result.state === "pending";
      attempt++
    ) {
      await sleep(1500);
      result = await confirmQrPayment(qrId, notification);
    }

    if (result.state === "paid") {
      res.json({ success: true, message: "OK" });
      return;
    }

    // The bank never retries; the reconciler will pick this up
    console.warn("BNB notification not filfilled", {
      qrId: qrId,
      state: result.state,
      reason: result.state === "error" ? result.reason : undefined,
    });

    res.json({
      success: false,
      message:
        result.state === "error" ? result.reason : `QR state: ${result.state}`,
    });
  } catch (err) {
    console.error("BNB notification error", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
};

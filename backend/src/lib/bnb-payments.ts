import { and, eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { checkoutSession } from "../drizzle/schema";
import { alreadyPaid, fulfillCheckoutSession } from "./fulfillment";
import { bnb, toBoliviaDate } from "./bnb";

const PROVIDER = "qr_bolivia" as const;

type QrSession = typeof checkoutSession.$inferSelect;

export type BnbNotification = {
  amountCents?: number;
  voucherId?: string;
  originName?: string;
  sourceBankId?: number;
  transactionDateTime?: string;
};

export type ConfirmResult =
  | { state: "paid" }
  | { state: "pending" }
  | { state: "expired" }
  | { state: "error"; reason: string };

const findQrSession = async (qrId: string) => {
  const [session] = await db
    .select()
    .from(checkoutSession)
    .where(
      and(
        eq(checkoutSession.paymentProvider, PROVIDER),
        eq(checkoutSession.providerCheckoutId, qrId),
      ),
    )
    .limit(1);
  return session ?? null;
};

const deleteSession = async (sessionId: string) => {
  await db.delete(checkoutSession).where(eq(checkoutSession.id, sessionId));
};

// The single place that decides "this QR was paid". The webhook, the status endpoint and the reconciler all call it. The notification payload is only a hint: payment is decided by the bank's own status endpoint.
export const confirmQrPayment = async (
  qrId: string,
  notification?: BnbNotification,
): Promise<ConfirmResult> => {
  if (await alreadyPaid(PROVIDER, { providerOrderId: qrId })) {
    return { state: "paid" };
  }

  const session = await findQrSession(qrId);
  if (!session) {
    return { state: "error", reason: "No checkout session for this QR" };
  }

  const { status, voucherId } = await bnb.getQrStatus(qrId);
  if (status === "unused") return { state: "pending" };
  if (status === "expired") return { state: "expired" };
  if (status !== "used") {
    return { state: "error", reason: `Unexpected QR status: ${status}` };
  }

  // Paid according to the bank. Cross-check the amount with every source we have.
  let detail = null;
  try {
    detail = await bnb.getQrDetail(qrId, toBoliviaDate(session.createdAt));
  } catch (err) {
    console.warn(`BNB detail lookup failed for QR ${qrId}`, err);
  }

  const amounts = [detail?.amountCents, notification?.amountCents].filter(
    (value): value is number => {
      return typeof value === "number";
    },
  );

  if (
    amounts.some((amount) => {
      return amount !== session.totalCents;
    })
  ) {
    console.error(
      `BNB amount mismatch for QR ${qrId}: expected ${session.totalCents}, got ${amounts.join(", ")}. NOT fulfilled, needs manual review`,
    );
    return { state: "error", reason: "Paid amount does not match the order" };
  }

  if (detail?.currency && detail.currency.toUpperCase() !== "BOB") {
    console.error(`BNB unexpected currency for QR ${qrId}: ${detail.currency}`);
    return { state: "error", reason: "Unexpected currency" };
  }

  if (amounts.length === 0) {
    console.warn(`BNB amount could not be verified for QR ${qrId}`);
  }

  const created = await fulfillCheckoutSession({
    provider: PROVIDER,
    sessionId: session.id,
    providerOrderId: qrId,
    providerCheckoutId: qrId,
    // everything needed for a manual refund later
    providerReference: {
      qrId: qrId,
      checkoutSessionId: session.id,
      voucherId:
        voucherId ?? notification?.voucherId ?? detail?.voucherId ?? null,
      originName: notification?.sourceBankId ?? null,
      sourceBankId: notification?.sourceBankId ?? null,
      transactionDateTime: notification?.transactionDateTime ?? null,
    },
  });

  if (created || (await alreadyPaid(PROVIDER, { providerOrderId: qrId }))) {
    return { state: "paid" };
  }
  return { state: "error", reason: "Fulfillment did not create an order" };
};

// Gives up on a session (customer left, our window ended, or a newer QR replaces it): cancel at the bank, then re-check, because a payment may have landed while we were cancelling
export const abandonQrSession = async (
  session: QrSession,
): Promise<ConfirmResult> => {
  const qrId = session.providerCheckoutId;
  if (!qrId) {
    await deleteSession(session.id);
    return { state: "expired" };
  }
  const current = await confirmQrPayment(qrId);
  if (current.state === "paid") return current;
  if (current.state === "expired") {
    await deleteSession(session.id);
    return current;
  }
  if (current.state === "error") return current; //keep it for manual review

  let cancelled = false;
  try {
    await bnb.cancelQr(qrId);
    cancelled = true;
  } catch (err) {
    console.error(`BNB cancel failed for QR ${qrId}`, err);
  }

  const after = await confirmQrPayment(qrId);
  if (after.state === "paid") return after;
  if (cancelled || after.state === "expired") {
    await deleteSession(session.id);
    return { state: "expired" };
  }

  return after;
};

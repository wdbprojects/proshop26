import { and, asc, eq, gte } from "drizzle-orm";
import { abandonQrSession, confirmQrPayment } from "./bnb-payments";
import { checkoutSession } from "../drizzle/schema";
import { db } from "../drizzle/db";

const BATCH_SIZE = 50;
// Past this age a session is left alone, so one stuck row can't be retried forever
const GIVE_UP_AFTER_MS = 48 * 60 * 60 * 1000;

let running = false;

// Safety net for everything the webhook misses (the bank never retries)
export const runQrReconciliation = async () => {
  if (running) return;
  running = true;
  try {
    const sessions = await db
      .select()
      .from(checkoutSession)
      .where(
        and(
          eq(checkoutSession.paymentProvider, "qr_bolivia"),
          gte(
            checkoutSession.createdAt,
            new Date(Date.now() - GIVE_UP_AFTER_MS),
          ),
        ),
      )
      .orderBy(asc(checkoutSession.createdAt))
      .limit(BATCH_SIZE);

    for (const session of sessions) {
      try {
        const expired =
          session.expiresAt !== null &&
          session.expiresAt.getTime() < Date.now();
        if (expired) {
          await abandonQrSession(session);
        } else if (session.providerCheckoutId) {
          await confirmQrPayment(session.providerCheckoutId);
        }
      } catch (err) {
        console.error(
          `QR reconciliation failed for session ${session.id}`,
          err,
        );
      }
    }
  } finally {
    running = false;
  }
};

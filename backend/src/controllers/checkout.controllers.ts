import z from "zod";
import { NextFunction, Request, Response } from "express";
import { getEnv } from "../config/env";
import {
  checkoutSession,
  CheckoutSessionLine,
  orders,
  PaymentProvider,
} from "../drizzle/schema";
import { getCartItemsForCheckout, getOrCreateCart } from "./cart.controllers";
import { ApiError } from "../lib/api-error";
import { db } from "../drizzle/db";
import { polarCreateCheckout } from "../lib/polar";
import { and, eq } from "drizzle-orm";
import { bnb, isBnbEnabled, toBoliviaDate } from "../lib/bnb";
import { abandonQrSession, confirmQrPayment } from "../lib/bnb-payments";

const ENV = getEnv();

const POLAR: PaymentProvider = "polar";
const QR: PaymentProvider = "qr_bolivia";

const QR_SESSION_MINUTES = 30;
// Short and plain: the bank documents no limits for gloss
const QR_GLOSS_PREFIX = "Mercia";

// Checkout always works from the caller's persisted cart, never from the request body. Prices, availability and stock are re-read from the products table.
const buildCheckoutFromCart = async (req: Request) => {
  const cartRow = await getOrCreateCart(req.cartContext!);
  const rows = await getCartItemsForCheckout(cartRow.id);

  if (rows.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  let totalCents = 0;
  const lines: CheckoutSessionLine[] = [];
  const currencies = new Set<string>();

  for (const row of rows) {
    if (!row.active) {
      throw new ApiError(
        409,
        `"${row.name}" is no longer available. Remove it from your cart to continue.`,
      );
    }
    if (row.quantity > row.stock) {
      throw new ApiError(
        409,
        `Only ${row.stock} of "${row.name}" left in stock. Update your cart to continue.`,
      );
    }
    totalCents += row.priceCents * row.quantity;
    currencies.add(row.currency.toLowerCase());
    lines.push({
      productId: row.productId,
      quantity: row.quantity,
      unitPriceCents: row.priceCents,
    });
  }
  return { lines: lines, totalCents: totalCents, currencies: currencies };
};

// POST /api/checkout (card, via Polar)
export const createCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userSession = req.session!;
    if (!ENV.POLAR_ACCESS_TOKEN) {
      throw new ApiError(503, "Payments are not configured");
    }
    const { lines, totalCents, currencies } = await buildCheckoutFromCart(req);
    if (
      [...currencies].some((currency) => {
        return currency !== "usd";
      })
    ) {
      throw new ApiError(
        409,
        "Card payments require every product to be priced in USD ",
      );
    }
    if (totalCents < 10) {
      throw new ApiError(
        400,
        "Total below Polar minimum (e.g. USD requires at least 10 cents)",
      );
    }

    const [session] = await db
      .insert(checkoutSession)
      .values({
        userId: userSession.user.id,
        paymentProvider: POLAR,
        lines: lines,
        totalCents: totalCents,
        currency: "usd",
      })
      .returning();

    const successUrl = `${ENV.FRONTEND_URL}/checkout/return?checkout_id={CHECKOUT_ID}`;
    const returnUrl = `${ENV.FRONTEND_URL}/cart`;

    const checkout = await polarCreateCheckout(ENV, {
      products: [ENV.POLAR_CHECKOUT_PRODUCT_ID],
      prices: {
        [ENV.POLAR_CHECKOUT_PRODUCT_ID]: [
          {
            amount_type: "fixed",
            price_currency: "usd",
            price_amount: totalCents,
          },
        ],
      },
      success_url: successUrl,
      return_url: returnUrl,
      external_customer_id: userSession.user.id,
      metadata: { checkout_session_id: session.id },
    });
    await db
      .update(checkoutSession)
      .set({ providerCheckoutId: checkout.id })
      .where(eq(checkoutSession.id, session.id));
    res.json({ checkoutUrl: checkout.url });
  } catch (err) {
    next(err);
  }
};

// POST /api/checkout/qr (Bolivia QR, via BNB)
export const createQrCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userSession = req.session!;
    if (!isBnbEnabled) {
      throw new ApiError(503, "QR payments are not configured");
    }
    if (ENV.BNB_QR_ADMIN_ONLY === "true" && userSession.user.role !== "admin") {
      throw new ApiError(403, "QR payments are not available yet");
    }

    // Retire this user's older QR sessions first. If one of them was actually paid, this fulfills it, the cart empties, and the cart check below fails naturally instead of charging twice.

    const previous = await db
      .select()
      .from(checkoutSession)
      .where(
        and(
          eq(checkoutSession.userId, userSession.user.id),
          eq(checkoutSession.paymentProvider, QR),
        ),
      );
    for (const old of previous) {
      await abandonQrSession(old);
    }

    const { lines, totalCents, currencies } = await buildCheckoutFromCart(req);
    if (currencies.size !== 1 || !currencies.has("bob")) {
      throw new ApiError(
        409,
        "QR payments require every product in the cart to be priced in BOB",
      );
    }

    const expiresAt = new Date(Date.now() + QR_SESSION_MINUTES * 60 * 1000);
    const [session] = await db
      .insert(checkoutSession)
      .values({
        userId: userSession.user.id,
        paymentProvider: QR,
        lines: lines,
        totalCents: totalCents,
        currency: "bob",
        expiresAt: expiresAt,
      })
      .returning();

    try {
      const qr = await bnb.createQr({
        amountCents: totalCents,
        gloss: `${QR_GLOSS_PREFIX} ${session.id.slice(0, 8)}`,
        additionalData: session.id,
        expirationDate: toBoliviaDate(expiresAt),
      });
      await db
        .update(checkoutSession)
        .set({ providerCheckoutId: qr.qrId, qrImage: qr.qrImageBase64 })
        .where(eq(checkoutSession.id, session.id));

      res.status(201).json({
        qrId: qr.qrId,
        qrImage: qr.qrImageBase64,
        expiresAt: expiresAt.toISOString(),
        totalCents: totalCents,
        currency: "bob",
      });
    } catch (err) {
      console.error("BNB QR generation failed", err);
      await db
        .delete(checkoutSession)
        .where(eq(checkoutSession.id, session.id));
      throw new ApiError(502, "Could not generate the QR. Please try again.");
    }
  } catch (err) {
    next(err);
  }
};

const qrParamsSchema = z.object({ qrId: z.string().regex(/^\d+$/) });

const findQrOrderId = async (qrId: string, userId: string) => {
  const [order] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        eq(orders.paymentProvider, QR),
        eq(orders.providerCheckoutId, qrId),
        eq(orders.userId, userId),
      ),
    )
    .limit(1);
  return order?.id ?? null;
};

// GET /api/checkout/qr/:qrId (the frontend polls this every few seconds)
export const getQrCheckoutStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { qrId } = qrParamsSchema.parse(req.params);
    const userId = req.session!.user.id;

    const paidOrderId = await findQrOrderId(qrId, userId);
    if (paidOrderId) {
      res.json({ status: "paid", orderId: paidOrderId });
      return;
    }

    const [session] = await db
      .select()
      .from(checkoutSession)
      .where(
        and(
          eq(checkoutSession.paymentProvider, QR),
          eq(checkoutSession.providerCheckoutId, qrId),
          eq(checkoutSession.userId, userId),
        ),
      )
      .limit(1);

    if (!session) {
      throw new ApiError(404, "QR payment not found");
    }

    const windowEnded =
      session.expiresAt !== null && session.expiresAt.getTime() < Date.now();

    const result = windowEnded
      ? await abandonQrSession(session)
      : await confirmQrPayment(qrId);

    if (result.state === "paid") {
      res.json({ status: "paid", orderId: await findQrOrderId(qrId, userId) });
      return;
    }

    if (result.state === "expired" || windowEnded) {
      res.json({ status: "expired" });
      return;
    }

    if (result.state === "error") {
      console.error(`QR ${qrId} needs review: ${result.reason}`);
      res.json({ status: "error" });
      return;
    }

    res.json({
      status: "pending",
      qrImage: session.qrImage,
      expiresAt: session.expiresAt,
      totalCents: session.totalCents,
      currency: session.currency,
    });
  } catch (err) {
    next(err);
  }
};

import { NextFunction, Request, Response } from "express";
import { getEnv } from "../config/env";
import z from "zod";
import { getCurrentSession } from "../lib/session";
import {
  checkoutSession,
  CheckoutSessionLine,
  PaymentProvider,
  products,
} from "../drizzle/schema";
import { db } from "../drizzle/db";
import { and, inArray, eq } from "drizzle-orm";
import { polarCreateCheckout } from "../lib/polar";
import { getCartItemsForCheckout, getOrCreateCart } from "./cart.controllers";

const ENV = getEnv();

/* Only "polar" is wired up. When the Bolivia QR method lands, this becomes e.g. `req.body.paymentMethod` validated against a small zod enum, and the logic below branches on it before the provider-specific checkout call - the cart loading/stock validation above that point stays provider-agnostic and unchanged */
const PROVIDER: PaymentProvider = "polar";

/* requireAuth (checkout.router.ts) guarantees req.session is set below - checkout.router.ts is the one place besides admin.router.ts that requires login, since cart.router.ts allows guest carts */
export const createCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userSession = req.session!;

    // polar access token required
    if (!ENV.POLAR_ACCESS_TOKEN) {
      res.status(503).json({ error: "Payments are not configured" });
      return;
    }

    /* Checkout always operates on the caller's persisted cart - never on items posted in the request body. This keeps it consistent with whatever the cart badge/mini-cart page are showing (all backed by the same React Query ["cart"] cache), and means a stale or tempered client payload can no longer choose what gets charged. `resolveCart` middleware (mounted on this router) populates req.cartContext the same way it does for every cart endpoint. */
    const cartRow = await getOrCreateCart(req.cartContext!);
    const cartItemRows = await getCartItemsForCheckout(cartRow.id);

    if (cartItemRows.length === 0) {
      res.status(400).json({ error: "Your cart is empty" });
      return;
    }

    /* Recompute price AND validate stock server-side, from the current product rows - never trust priceCentsAtAdd (a snapshot only) amd never trust the client sent */
    let totalCents = 0;
    const lines: CheckoutSessionLine[] = [];

    for (const row of cartItemRows) {
      if (!row.active) {
        res.status(409).json({
          error: `"${row.name}" is no longer available. Remove it from yout cart to continue.`,
        });
        return;
      }
      totalCents += row.priceCents * row.quantity;
      lines.push({
        productId: row.productId,
        quantity: row.quantity,
        unitPriceCents: row.priceCents,
      });
    }
    if (totalCents < 10) {
      res.status(400).json({
        error:
          "Total below Polar minimum (e.g. USD requires at least 10 cents)",
      });
      return;
    }

    /* CREATE CHECKOUT SESSION IN DATABASE */
    const [session] = await db
      .insert(checkoutSession)
      .values({
        userId: userSession.user.id,
        paymentProvider: PROVIDER,
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
      external_customer_id: userSession?.user?.id,
      metadata: {
        checkout_session_id: session.id,
      },
    });
    await db
      .update(checkoutSession)
      .set({ providerCheckoutId: checkout.id })
      .where(eq(checkoutSession.id, session.id));
    res.json({
      checkoutUrl: checkout.url,
    });
  } catch (err) {
    next(err);
  }
};

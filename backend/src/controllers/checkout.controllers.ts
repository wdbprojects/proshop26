import { NextFunction, Request, Response } from "express";
import { getEnv } from "../config/env";
import z from "zod";
import { getCurrentSession } from "../lib/session";
import {
  checkoutSession,
  CheckoutSessionLine,
  products,
} from "../drizzle/schema";
import { db } from "../drizzle/db";
import { and, inArray, eq } from "drizzle-orm";
import { polarCreateCheckout } from "../lib/polar";

const ENV = getEnv();

const cartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    }),
  ),
});

export const createCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // only sign-in users can start checkout (session)
    const userSession = await getCurrentSession(req.headers);
    if (!userSession) {
      res.status(401).json({ error: "Unauthorized!!" });
      return;
    }

    const parsed = cartSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid cart!!!", details: parsed.error.flatten() });
      return;
    }
    // polar access token required
    if (!ENV.POLAR_ACCESS_TOKEN) {
      res.status(503).json({ error: "Payments are not configured" });
      return;
    }
    const ids = parsed.data.items.map((id) => {
      return id.productId;
    });
    // load all products from database
    const prodRows = await db
      .select()
      .from(products)
      .where(and(inArray(products.id, ids), eq(products.active, true)));

    if (prodRows.length !== ids.length) {
      res.status(400).json({ error: "One or more products are invalid" });
      return;
    }

    // calculate price (on the server side always)
    const byId = new Map(
      prodRows.map((prod) => {
        return [prod.id, prod];
      }),
    );
    let totalCents = 0;
    const lines: CheckoutSessionLine[] = [];

    for (const line of parsed.data.items) {
      const prod = byId.get(line.productId)!;
      const unitPriceCents = prod.priceCents;

      if (unitPriceCents === null) {
        res.status(400).json({ error: "One or more products are invalid" });
        return;
      }

      totalCents += unitPriceCents * line.quantity;
      lines.push({
        productId: prod.id,
        quantity: line.quantity,
        unitPriceCents: unitPriceCents,
      });
    }
    if (totalCents < 10) {
      res.status(400).json({
        error:
          "Total below Polar minimum (e.g. USD required at least 10 cents)",
      });
      return;
    }

    // create checkout session in database
    const [session] = await db
      .insert(checkoutSession)
      .values({
        userId: userSession?.user?.id as string,
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
      .set({ polarCheckoutId: checkout.id })
      .where(eq(checkoutSession.id, session.id));
    res.json({
      checkoutUrl: checkout.url,
    });
  } catch (error) {
    next(error);
  }
};

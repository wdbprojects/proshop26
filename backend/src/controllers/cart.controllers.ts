import { NextFunction, Request, Response } from "express";
import type { CartContext } from "../middlewares/resolve-cart";
import { and, asc, eq, sql } from "drizzle-orm";
import { cart, cartItems, productImages, products } from "../drizzle/schema";
import { db } from "../drizzle/db";
import { ApiError } from "../lib/api-error";
import {
  addCartItemsSchema,
  updateCartItemsSchema,
} from "../validators/cart.validators";

import z from "zod";

// Find the cart request's identity, creating one if needed
const getOrCreateCart = async (cartContext: CartContext) => {
  const { userId, sessionCartId } = cartContext;
  const existing = userId
    ? await db.query.cart.findFirst({ where: eq(cart.userId, userId) })
    : sessionCartId
      ? await db.query.cart.findFirst({
          where: eq(cart.sessionCartId, sessionCartId),
        })
      : null;
  if (existing) return existing;
  const [created] = await db
    .insert(cart)
    .values({
      userId: userId ?? null,
      sessionCartId: userId ? null : sessionCartId,
    })
    .returning();
  return created;
};

// recompute cart.itemsPriceCents/totalPriceCents from current cart_item rows joined against products' CURRENT price --not the priceCentsAtAdd snapshot. This keeps the displayed cart total consistent with what checkout will actually charge; priceCentsAtAdd is only for showing the customer "price change since you added this"
const recalculateCartTotals = async (cartId: string) => {
  const rows = await db
    .select({
      quantity: cartItems.quantity,
      priceCents: products.priceCents,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId));
  const itemsPriceCents = rows.reduce((sum, row) => {
    return sum + row.quantity * row.priceCents;
  }, 0);
  // shipping/tax belong to checkout, not the cart --left at 0 here
  const totalPriceCents = itemsPriceCents;
  await db
    .update(cart)
    .set({ itemsPriceCents, totalPriceCents })
    .where(eq(cart.id, cartId));
};

// shared shape returned by GET /api/cart and every mutation endpoint, so the frontend never needs a second request just to see the result of an add/update/remove
const getHydratedCart = async (cartId: string) => {
  const cartRow = await db.query.cart.findFirst({ where: eq(cart.id, cartId) });
  if (!cartRow) {
    throw new ApiError(404, "Cart not found");
  }

  /* Relational query instead of a manual .select()/.innerJoin() - lets us pull in each product's first image the same way product.controllers.ts already does, instead of a separate query per item. */

  const rows = await db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cartId),
    with: {
      product: {
        with: {
          images: { orderBy: asc(productImages.order), limit: 1 },
        },
      },
    },
  });

  const items = rows.map((row) => {
    return {
      id: row.id,
      productId: row.productId,
      quantity: row.quantity,
      priceCentsAtAdd: row.priceCentsAtAdd,
      name: row.product.name,
      slug: row.product.slug,
      priceCents: row.product.priceCents,
      currency: row.product.currency,
      stock: row.product.stock,
      image: row.product.images[0]?.url ?? null,
    };
  });

  return {
    id: cartRow.id,
    itemsPriceCents: cartRow.itemsPriceCents,
    totalPriceCents: cartRow.totalPriceCents,
    shippingPriceCents: cartRow.shippingPriceCents,
    taxPriceCents: cartRow.taxPriceCents,
    items: items,
  };
};

/* GET /api/cart */
export const getCartHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cartRow = await getOrCreateCart(req.cartContext!);
    const hydratedCart = await getHydratedCart(cartRow.id);
    res.json({ cart: hydratedCart });
  } catch (err) {
    next(err);
  }
};

/* POST /api/cart/items --add to cart, or increment if already present */
export const addCartItemsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = addCartItemsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid request body");
    }
    const { productId, quantity } = parsed.data;
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });
    if (!product || !product.active) {
      throw new ApiError(404, "Product not found");
    }

    const cartRow = await getOrCreateCart(req.cartContext!);

    await db.transaction(async (tx) => {
      const existingItem = await tx.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, cartRow.id),
          eq(cartItems.productId, productId),
        ),
      });
      const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

      /* known limitation: under concurrent requests for the same product, this check can be raced past stock by a small margin. Acceptable for now --checkout still re-validates stock before charging */
      if (nextQuantity > product.stock) {
        throw new ApiError(409, `Only ${product.stock} left in stock`);
      }
      await tx
        .insert(cartItems)
        .values({
          cartId: cartRow.id,
          productId: productId,
          quantity: quantity,
          priceCentsAtAdd: product.priceCents,
        })
        .onConflictDoUpdate({
          target: [cartItems.cartId, cartItems.productId],
          set: {
            quantity: sql`${cartItems.quantity} + ${quantity}`,
            // refresh the snapshot on every add so "price changed" only ever reflects genuinely untouched cart lines.
            priceCentsAtAdd: product.priceCents,
            updatedAt: new Date(),
          },
        });
    });
    await recalculateCartTotals(cartRow.id);
    const hydratedCart = await getHydratedCart(cartRow.id);

    res.status(201).json({ cart: hydratedCart });
  } catch (err) {
    next(err);
  }
};

/* PATCH /api/cart/items/:cartItemId — set exact quantity (0 removes it) */
export const updateCartItemsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = updateCartItemsSchema.safeParse({
      ...req.body,
      cartItemId: req.params.cartItemId,
    });

    if (!parsed.success) {
      throw new ApiError(400, "Invalid request body");
    }
    const { cartItemId, quantity } = parsed.data;
    const cartRow = await getOrCreateCart(req.cartContext!);
    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.id, cartItemId),
        eq(cartItems.cartId, cartRow.id),
      ),
    });
    if (!existingItem) {
      throw new ApiError(404, "Cart item not found");
    }
    if (quantity === 0) {
      await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
    } else {
      const product = await db.query.products.findFirst({
        where: eq(products.id, existingItem.productId),
      });
      if (!product || !product.active) {
        throw new ApiError(404, "Product not found");
      }
      if (quantity > product.stock) {
        throw new ApiError(409, `Only ${product.stock} left in stock`);
      }
      await db
        .update(cartItems)
        .set({
          quantity: quantity,
          priceCentsAtAdd: product.priceCents,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, cartItemId));
    }

    await recalculateCartTotals(cartRow.id);
    const hydratedCart = await getHydratedCart(cartRow.id);

    res.json({ cart: hydratedCart });
  } catch (err) {
    next(err);
  }
};

/* DELETE /api/cart/items/:cartItemId */
export const deleteCartItemsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedParams = z
      .object({ cartItemId: z.string().uuid() })
      .safeParse(req.params);
    if (!parsedParams.success) {
      throw new ApiError(400, "Invalid cart item id");
    }
    const { cartItemId } = parsedParams.data;

    const cartRow = await getOrCreateCart(req.cartContext!);

    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.id, cartItemId),
        eq(cartItems.cartId, cartRow.id),
      ),
    });

    if (!existingItem) {
      throw new ApiError(404, "Cart item not found");
    }

    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
    await recalculateCartTotals(cartRow.id);
    const hydratedCart = await getHydratedCart(cartRow.id);
    res.json({ cart: hydratedCart });
  } catch (err) {
    next(err);
  }
};

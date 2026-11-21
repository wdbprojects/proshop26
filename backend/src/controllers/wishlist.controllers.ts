import { NextFunction, Request, Response } from "express";
import { productImages, products, wishlistItems } from "../drizzle/schema";
import { asc, desc, eq, and } from "drizzle-orm";
import { db } from "../drizzle/db";
import { wishlistParamSchema } from "../validators/wishlist.validators";
import { ApiError } from "../lib/api-error";

// GET /api/wishlist - full products, newest saved first
export const listWishlistHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const rows = await db.query.wishlistItems.findMany({
      where: eq(wishlistItems.userId, userId),
      orderBy: desc(wishlistItems.createdAt),
      with: {
        product: {
          with: {
            images: { orderBy: asc(productImages.order) },
            category: true,
          },
        },
      },
    });
    res.json({
      products: rows
        .map((row) => {
          return row.product;
        })
        .filter((product) => {
          return product.active;
        }),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/wishlist/ids - just the ids, to draw the hearts
export const listWishlistIdsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const rows = await db
      .select({ productId: wishlistItems.productId })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .where(and(eq(wishlistItems.userId, userId), eq(products.active, true)));
    res.json({ ids: rows.map((row) => row.productId) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/wishlist/:productId - save (saving twice is fine)
export const addWishlistHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const { productId } = wishlistParamSchema.parse(req.params);

    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, productId), eq(products.active, true)))
      .limit(1);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    await db
      .insert(wishlistItems)
      .values({ userId, productId })
      .onConflictDoNothing({
        target: [wishlistItems.userId, wishlistItems.productId],
      });
    res.json({ saved: true });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/wishlist/:productId - remove (removing a missing one is fine)
export const removeWishlistHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const { productId } = wishlistParamSchema.parse(req.params);
    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, userId),
          eq(wishlistItems.productId, productId),
        ),
      );
    res.json({ saved: false });
  } catch (err) {
    next(err);
  }
};

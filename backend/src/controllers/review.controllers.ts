import { NextFunction, Request, Response } from "express";
import {
  reviewParamsSchema,
  upsertReviewSchema,
} from "../validators/review.validators";
import { db } from "../drizzle/db";
import { ApiError } from "../lib/api-error";
import { orderItems, orders, products, reviews } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

/* PUT /api/reviews/:productId - create or change my rating */
export const upsertReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const { productId } = reviewParamsSchema.parse(req.params);
    const { rating } = upsertReviewSchema.parse(req.body);

    /* Verified purchaser: at least one PAID order of mine containing this product */
    const [purchase] = await db
      .select({ id: orders.id })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, userId),
          eq(orders.status, "paid"),
          eq(orderItems.productId, productId),
        ),
      )
      .limit(1);
    if (!purchase) {
      throw new ApiError(
        403,
        "Only customers who bought this product can rate it",
      );
    }

    const summary = await db.transaction(async (tx) => {
      /* Lock the product row first. Without it, two people rating the same product at the same moment could each compute the aggregate without seeing the other's insert, and the last UPDATE would win with a stale count */
      await tx
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, productId))
        .for("update");
      await tx
        .insert(reviews)
        .values({ userId, productId, rating })
        .onConflictDoUpdate({
          target: [reviews.userId, reviews.productId],
          set: { rating: rating, updatedAt: new Date() },
        });
      const [agg] = await tx
        .select({
          avg: sql<string>`coalesce(round(avg(${reviews.rating}), 2), 0)::text`,
          count: sql<number>`count(*)::int`,
        })
        .from(reviews)
        .where(eq(reviews.productId, productId));
      const [updated] = await tx
        .update(products)
        .set({ rating: agg.avg, numReviews: agg.count })
        .where(eq(products.id, productId))
        .returning({
          rating: products.rating,
          numReviews: products.numReviews,
        });
      return updated;
    });
    res.json({ rating: rating, product: summary });
  } catch (err) {
    next(err);
  }
};

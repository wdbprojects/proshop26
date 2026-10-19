import z from "zod";

export const reviewParamsSchema = z.object({
  productId: z.uuid({ message: "Invalid product id" }),
});

export const upsertReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

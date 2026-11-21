import z from "zod";

export const wishlistParamSchema = z.object({
  productId: z.uuid({ message: "Invalid product id" }),
});

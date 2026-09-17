import { z } from "better-auth";

export const addCartItemSchema = z.object({
  productId: z.string().uuid({ message: "Invalid product id" }),
  quantity: z
    .number()
    .int()
    .positive({ message: "Quantity must be at least 1" }),
});
export type AddCartItemSchemaType = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  cartItemId: z.string().uuid({ message: "Invalid cart item id" }),
  quantity: z
    .number()
    .int()
    .nonnegative({ message: "Quantity must be zero or more" }),
});
export type UpdateCartItemSchemaType = z.infer<typeof updateCartItemSchema>;

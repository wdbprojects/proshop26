import z from "zod";

export const addCartItemsSchema = z.object({
  productId: z.string().uuid({ message: "Invalid product ID" }),
  quantity: z
    .number()
    .int()
    .positive({ message: "Quantity must be at least 1" }),
});
export type AddCartItemInput = z.infer<typeof addCartItemsSchema>;

export const updateCartItemsSchema = z.object({
  cartItemId: z.string().uuid({ message: "Invalid cart item ID" }),
  quantity: z
    .number()
    .int()
    .nonnegative({ message: "Quantity must be zero or more" }),
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemsSchema>;

import z from "zod";
import { ChannelData } from "stream-chat";
import { formatNumberWithDecimal } from "../lib/utils";

export const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    { message: "Price must have exactly two decimal places" },
  );

export type ExtendedChannelData = ChannelData & {
  name: string;
};

/* CART SCHEMAS */
export const addCartItemSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  quantity: z
    .number()
    .int()
    .positive({ message: "Quantity must be at least 1" }),
});
export type AddCartItemsSchemaType = z.infer<typeof addCartItemSchema>;

export const updateCartItemsSchema = z.object({
  cartItemId: z.string().min(1, { message: "Cart Item ID is required" }),
  quantity: z
    .number()
    .int()
    .nonnegative({ message: "Quantity must be zero or more" }),
});
export type UpdateCartItemsSchemaType = z.infer<typeof updateCartItemsSchema>;

export const cartItemsSchema = z.object({
  id: z.string(),
  productId: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string(),
  quantity: z.number().int().nonnegative(),
  priceCentsAtAdd: z.number().int().nonnegative,
});
export type CartItemsSchemaType = z.infer<typeof cartItemsSchema>;

export const insertCartSchema = z.object({
  sessionCartId: z.string().min(1).optional(),
  userId: z.string().optional().nullable(),
});
export type InsertCartSchemaType = z.infer<typeof insertCartSchema>;

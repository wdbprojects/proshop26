import z from "zod";
import { ChannelData } from "stream-chat";
import { formatNumberWithDecimal } from "../lib/utils";

export const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    { message: "Price must have exactly two decimal places" },
  );

export const productCreateSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters" }),
  category: z
    .string()
    .min(3, { message: "Category must be at least 3 characters" }),
  brand: z.string().min(1, { message: "Brand must be at least 1 character" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  longDescription: z
    .string()
    .min(10, { message: "Long description must be at least 10 characters" }),
  stock: z.coerce
    .number()
    .int()
    .nonnegative({ message: "Stock mus be zero or a positive whole number" }),
  isFeatured: z.boolean(),
  banner: z.string().optional(),
  priceCents: z.number().int().positive(),
  currency: z.string().min(1).default("usd"),
  active: z.boolean(),
});
export type ProductCreateSchemaType = z.infer<typeof productCreateSchema> & {
  id: string;
  rating: number;
  createdAt: Date;
};

export const productUpdateSchema = productCreateSchema.partial();

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

import z from "zod";
import { ChannelData } from "stream-chat";
import { formatNumberWithDecimal } from "../lib/utils";
import { IOrder, IOrderItem } from "./types";

export const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    { message: "Price must have exactly two decimal places" },
  );

/* CATEGORY SCHEMAS */
export const categorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z.string().min(2, { message: "Slug must be at least 2 characters" }),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
});
export type CategorySchemaType = z.infer<typeof categorySchema> & {
  id: string;
  createdAt: Date;
};

export type CategoriesResponse = { categories: CategorySchemaType[] };

/* PRODUCT SCHEMAS */
export const productCreateSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters" }),
  categoryId: z.string().uuid({ message: "Category is required" }),
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
    .nonnegative({ message: "Stock must be zero or a positive whole number" }),
  isFeatured: z.boolean(),
  priceCents: z.number().int().positive(),
  currency: z.string().min(1).default("usd"),
  active: z.boolean(),
});

export type ProductCreateSchemaType = z.infer<typeof productCreateSchema> & {
  id: string;
  rating: number;
  numReviews: number;
  createdAt: Date;
};

export const productUpdateSchema = productCreateSchema.partial();

/* Shape of a product as returned by GET endpoints (list, detail, cart, etc.) - `category` and `images` are hydrated relations, not raw create-payload fields, so this is NOT the same shape the admin create/update form submits (ProductCreateSchemaType above, which uses categoryId - a plain uuid). Components rendering fetched products (catalog-product-card.tsx and similar) should use this type instead. */

export type ProductImageType = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  order: number;
};

export type ProductType = Omit<ProductCreateSchemaType, "categoryId"> & {
  category: CategorySchemaType;
  images: ProductImageType[];
};

export type ExtendedChannelData = ChannelData & {
  name: string;
};

/* CART SCHEMAS */
export const addCartItemSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  quantity: z
    .number()
    .int()
    .nonnegative({ message: "Quantity must be zero or more" }),
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
  price: z.number().int().nonnegative,
});

export type CartItemsSchemaType = z.infer<typeof cartItemsSchema>;

export const insertCartSchema = z.object({
  sessionCartId: z.string().min(1).optional(),
  userId: z.string().optional().nullable(),
});
export type InsertCartSchemaType = z.infer<typeof insertCartSchema>;

export type ProductFormData = ProductCreateSchemaType & {
  images: ProductImageType[];
};

/*  CHECK TO REMOVE LATER */
export type OrderDetailsResponse = {
  items: IOrderItem[];
  singleOrder: Omit<IOrder, "previewItems">;
};

export type ImageKitAuthResponse = {
  publicKey: string;
  token: string;
  expire: number;
};

export type ImageKitAuthenticatorType = {
  signature: string;
  expire: number;
  token: string;
  publicKey: string;
};

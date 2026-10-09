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

/* PRODUCT IMAGE SCHEMAS */
/* Mirrors the backend's product.validators.ts exactly - both sides need to agree on this shape, since a mismatch here means the form validates locally then gets rejected by the API. */
const newProductImageSchema = z.object({
  url: z.url(),
  imageKitFileId: z.string().min(1),
  alt: z.string().optional(),
});
/* Update-only: an `id` present means "existing product_images row - keep it, maybe reorder it.". No `id` means "new upload, insert it.". Every entry still needs imageKitFileId, including kept ones - that's why ProductImageType (below) has to carry it through from the GET response. */
const existingProductImageSchema = newProductImageSchema.extend({
  id: z.uuid().optional(),
});
const slugSchema = z
  .string()
  .min(3, { message: "Slug must be at least 3 characters" })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase letters, numbers and hyphens only",
  });

/* PRODUCT SCHEMAS */
export const productCreateSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  slug: slugSchema,
  categoryId: z.uuid({ message: "Category is required" }),
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
  images: z
    .array(newProductImageSchema)
    .min(1, { message: "At least one image is required" }),
});

export type ProductCreateSchemaType = z.infer<typeof productCreateSchema> & {
  id: string;
  rating: number;
  numReviews: number;
  createdAt: Date;
};

/* Deliberately NOT productCreateSchema.partial() - currency has a .default(...), and in a .partial() that default still fires on an absent key, so an update omitting currency would silently reset it to "usd". Defined from scratch instead, so an omitted field really means "leave it alone". Matches the same fix already applied on the backend. */
export const productUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  slug: slugSchema.optional(),
  categoryId: z.uuid({ message: "Invalid category" }).optional(),
  brand: z.string().min(1).optional(),
  description: z.string().min(10).optional(),
  longDescription: z.string().min(10).optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  priceCents: z.number().int().positive().optional(),
  currency: z.string().min(1).optional(),
  isFeatured: z.boolean().optional(),
  active: z.boolean().optional(),
  images: z.array(existingProductImageSchema).min(1).optional(),
});
export type ProductUpdateSchemaType = z.infer<typeof productUpdateSchema>;

/* Shape of a product as returned by GET endpoints (list, detail, cart, etc.) - `category` and `images` are hydrated relations, not raw create-payload fields, so this is NOT the same shape the admin create/update form submits (ProductCreateSchemaType above, which uses categoryId - a plain uuid). Components rendering fetched products (catalog-product-card.tsx and similar) should use this type instead. */

export type ProductImageType = {
  id: string;
  url: string;
  /* required on every image the API returns - needed to round-trip an existing image back into an update payload, where it's a required field even on images that aren't changing. */
  imageKitFileId: string | null;
  alt: string | null;
  isPrimary: boolean;
  order: number;
};

export type ProductType = Omit<
  ProductCreateSchemaType,
  "categoryId" | "images"
> & {
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
  price: z.number().int().nonnegative(),
});
export type CartItemsSchemaType = z.infer<typeof cartItemsSchema>;

export const insertCartSchema = z.object({
  sessionCartId: z.string().min(1).optional(),
  userId: z.string().optional().nullable(),
});
export type InsertCartSchemaType = z.infer<typeof insertCartSchema>;

export type ProductFormData = Omit<ProductCreateSchemaType, "images"> & {
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

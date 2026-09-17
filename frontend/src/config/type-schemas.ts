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
  stock: z.coerce.number(),
  // images: z.array(z.string()).optional(),
  isFeatured: z.boolean(),
  banner: z.string().optional(),
  priceCents: z.number().int().positive(),
  currency: z.string().min(1).default("usd"),
  numReviews: z.number().optional(),
  /*   imageFile: z
    .instanceof(File)
    .refine((file) => {
      return (file.size <= 5 * 1024 * 1024, "File must be less than 5MB");
    })
    .refine((file) => {
      return ["image/jpeg", "image/png", "image/jpg"].includes(file.type);
    })
    .optional(), */
  active: z.boolean(),
});
export type ProductFormData = z.infer<typeof productCreateSchema>;
export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  isPrimary: boolean;
  imageKitFileId: string | null;
};
export type ProductCreateSchemaType = z.infer<typeof productCreateSchema> & {
  id: string;
  rating: number;
  createdAt: Date;
  images: ProductImage[];
};

export type ProductWithId = ProductFormData & {
  id: string;
};

export const productUpdateSchema = productCreateSchema.partial();

export type ExtendedChannelData = ChannelData & {
  name: string;
};

export interface CategoriesResponse {
  categories: string[];
}

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

export const cartItemsSchema = z.object({
  // id: z.string(),
  productId: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string(),
  quantity: z.number().int().nonnegative(),
  price: z.number().int().nonnegative,
});

export type CartItemsSchemaType = z.infer<typeof cartItemsSchema>;

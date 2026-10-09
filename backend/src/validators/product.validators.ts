import z from "zod";
import { getEnv } from "../config/env";

const ENV = getEnv();

/* Only accept image URLs actually hosted on this project's ImageKit endpoint - otherwise nothing stops a client pointing a product at an arbitrary (or malicious) URL. */
const imageKitUrl = z
  .string()
  .url()
  .refine((url) => {
    return (
      url.startsWith(ENV.IMAGEKIT_URL_ENDPOINT),
      {
        message: "Image URL must be hosted on this project's ImageKit endpoint",
      }
    );
  });

/* Matches what getProductBySlug/getAllProducts actually route on - catching a malformed slug here beats catching it as a 404 later */
const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers and hyphens only",
  );

const newProductImageSchema = z.object({
  url: imageKitUrl,
  imageKitFileId: z.string().min(1),
  alt: z.string().optional(),
});

/* Update only: an `id` present means "this is an existing product_images row - keep it, maybe reorder it.". No `id` means "this is a new upload, insert it.". Array order becomes the `order` column; index 0 becomes the primary image. */
const existingProductImageSchema = newProductImageSchema.extend({
  id: z.uuid().optional(),
});

export const productCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: slugSchema,
  categoryId: z.uuid({ message: "Category is required" }),
  brand: z.string().min(1).optional(),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .optional()
    .default(""),
  stock: z.coerce
    .number()
    .int()
    .nonnegative({ message: "Stock must be zero or a positive whole number" })
    .default(0),
  priceCents: z.number().int().positive(),
  currency: z.string().min(1).default("usd"),
  isFeatured: z.boolean().default(false),
  active: z.boolean().default(true),
  images: z
    .array(newProductImageSchema)
    .min(1, { message: "At least one image is required" }),
});
export type ProductCreateInput = z.infer<typeof productCreateSchema>;

/* Deliberately NOT productCreateSchema.partial() - several fields above have .default(...), and in a .partial() those defaults still fire on an absent key, so an update omitting `currency` would silently reset it to "usd". Defined from scratch instead, with no defaults, so an imitted field really means "leave it alone." */
export const productUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  slug: slugSchema.optional(),
  categoryId: z.uuid({ message: "invalid category" }).optional(),
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
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

export const productIdParamSchema = z.object({
  id: z.uuid({ message: "Invalid product id" }),
});

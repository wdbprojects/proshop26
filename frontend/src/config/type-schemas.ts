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
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must have at least 1 image"),
  isFeatured: z.boolean(),
  banner: z.string().optional(),
  price: currency,
  priceCents: z.number().int().positive(),
  currency: z.string().min(1).default("usd"),
  imageUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  imageKitFileId: z
    .union([z.string().min(1), z.literal(""), z.null()])
    .optional(),
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

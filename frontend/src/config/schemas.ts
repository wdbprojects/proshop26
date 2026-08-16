import z from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name has to be at least 3 characters" })
    .max(60, { message: "Name has to be at most 60 characters" }),
  slug: z
    .string()
    .min(3, { message: "Slug has to be at least 10 characters" })
    .max(100, { message: "Slug has to be at most 100 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  description: z
    .string()
    // .min(10, { message: "Description has to be at least 10 characters" })
    .max(100, { message: "Description has to be at most 100 characters" }),
  priceCents: z
    .number()
    .min(1, { message: "Price must be at least 1 cent" })
    .optional()
    .refine((val) => val === undefined || val > 0, {
      message: "price must be greater than 0",
    }),
  currency: z.string().min(1, { message: "Currency is a required field" }),
  // imageUrl: z.string(),
  imageFile: z
    .instanceof(File)
    .refine((file) => {
      return (file.size <= 5 * 1024 * 1024, "File must be less than 5MB");
    })
    .refine((file) => {
      return ["image/jpeg", "image/png", "image/jpg"].includes(file.type);
    })
    .optional(),
  active: z.boolean(),
});
export type ProductSchemaType = z.infer<typeof productSchema>;

export const uploadTestSchema = z.object({
  imageFile: z
    .instanceof(File)
    .refine((file) => {
      return (file.size <= 5 * 1024 * 1024, "File must be less than 5MB");
    })
    .refine((file) => {
      return ["image/jpeg", "image/jpg", "image/png"].includes(file.type);
    })
    .optional(),
  active: z.boolean(),
});
export type UploadTestSchemaType = z.infer<typeof uploadTestSchema>;

export const productCreateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is a required field" }),
  slug: z.string().min(1, { message: "Slug is a required field" }),
  category: z.string().min(1, { message: "Category is a required field" }),
  description: z.string(),
  priceCents: z
    .number()
    .min(1, { message: "Price must be at least 1 cent" })
    .optional()
    .refine((val) => val === undefined || val > 0, {
      message: "price must be greater than 0",
    }),
  currency: z.string().min(1, { message: "Currency is a required field" }),
  imageFile: z
    .instanceof(File)
    .refine((file) => {
      return (file.size <= 5 * 1024 * 1024, "File must be less than 5MB");
    })
    .refine((file) => {
      return ["image/jpeg", "image/png", "image/jpg"].includes(file.type);
    })
    .optional(),
  imageUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  imageKitFileId: z.union([z.string(), z.literal(""), z.null()]).optional(),
  active: z.boolean().optional(),
});
export type ProductCreateType = z.infer<typeof productCreateSchema>;

export const productPatch = productCreateSchema.partial();
export type ProductPatchType = z.infer<typeof productPatch>;

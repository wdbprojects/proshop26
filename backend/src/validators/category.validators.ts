import z from "zod";

const categorySlugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers and hyphens only",
  );

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  slug: categorySlugSchema,
  description: z.string().trim().max(300).default(""),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  active: z.boolean().default(true),
});

// no defaults on purpose: an omitted field means "leave it alone" (same reasoning as productUpdateSchema)
export const categoryUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  slug: categorySlugSchema.optional(),
  description: z.string().trim().max(300).optional(),
  displayOrder: z.number().int().min(0).max(9999).optional(),
  active: z.boolean().optional(),
});

export const categoryIdParamSchema = z.object({
  id: z.uuid({ message: "Invalid category id" }),
});

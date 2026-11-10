import { z } from "zod";
import type { IAdminCategory } from "@/config/type-schemas";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(80, { message: "Name is too long" }),
  slug: z
    .string()
    .trim()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Lowercase letters, numbers and hyphens only",
    }),
  description: z.string().trim().max(300, { message: "Max 300 characters" }),
  displayOrder: z
    .string()
    .regex(/^\d{1,4}$/, { message: "Enter a whole number from 0 to 9999" }),
  active: z.boolean(),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const emptyCategory: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  displayOrder: "0",
  active: true,
};

export const toCategoryFormValues = (
  category: IAdminCategory,
): CategoryFormValues => {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    displayOrder: String(category.displayOrder),
    active: category.active,
  };
};

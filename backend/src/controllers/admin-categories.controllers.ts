import { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/api-error";
import { isForeignKeyViolation, isUniqueViolation } from "../lib/utils";
import { categories, products } from "../drizzle/schema";
import { eq, sql, asc } from "drizzle-orm";
import { db } from "../drizzle/db";

import {
  categoryCreateSchema,
  categoryIdParamSchema,
  categoryUpdateSchema,
} from "../validators/category.validators";

const SLUG_TAKEN = "A category with this slug already exists.";

// GET /api/admin/categories - every category, active or not, with its product count
export const listAdminCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        displayOrder: categories.displayOrder,
        active: categories.active,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: sql<number>`(select count(*)::int from products where products.category_id = "categories"."id")`,
      })
      .from(categories)
      .orderBy(asc(categories.displayOrder), asc(categories.name));
    res.json({ categories: rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/categories
export const createAdminCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = categoryCreateSchema.parse(req.body);
    const [row] = await db
      .insert(categories)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        displayOrder: input.displayOrder,
        active: input.active,
      })
      .returning();
    res.status(201).json({ category: row });
  } catch (err) {
    if (isUniqueViolation(err)) return next(new ApiError(409, SLUG_TAKEN));
    next(err);
  }
};

// PATCH /api/admin/categories/:id
export const updateAdminCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const input = categoryUpdateSchema.parse(req.body);

    const data: Partial<typeof categories.$inferInsert> = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.description !== undefined)
      data.description = input.description || null;
    if (input.displayOrder !== undefined)
      data.displayOrder = input.displayOrder;
    if (input.active !== undefined) data.active = input.active;
    if (Object.keys(data).length === 0) {
      throw new ApiError(400, "No fields to update");
    }
    const [row] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    if (!row) throw new ApiError(404, "Category not found");
    res.json({ category: row });
  } catch (err) {
    if (isUniqueViolation(err)) return next(new ApiError(409, SLUG_TAKEN));
    next(err);
  }
};

// DELETE /api/admin/categories/:id - only when no product uses it
export const deleteAdminCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.categoryId, id));
    if (total > 0) {
      throw new ApiError(
        409,
        `This category has ${total} product${total === 1 ? "" : "s"}. Move or delete them first, or deactivate the category instead.`,
      );
    }
    const [removed] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    if (!removed) throw new ApiError(404, "Category not found");
    res.json({ success: true });
  } catch (err) {
    // a product was added between the count and the delete
    if (isForeignKeyViolation(err)) {
      return next(
        new ApiError(
          409,
          "This category now has products. Deactivate it instead.",
        ),
      );
    }
  }
};

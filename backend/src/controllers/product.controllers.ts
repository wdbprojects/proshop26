import { NextFunction, Request, Response } from "express";
import { db } from "../drizzle/db";
import { categories, productImages, products } from "../drizzle/schema";
import { asc, desc, eq, and, sql } from "drizzle-orm";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 48;

const parsePositiveInt = (value: unknown, fallback: number, max?: number) => {
  const num = typeof value === "string" ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return max ? Math.min(num, max) : num;
};

/* GET ALL PRODUCTS */
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categorySlug =
      typeof req.query.category === "string" ? req.query.category.trim() : "";
    const featuredOnly = req.query.featured === "true";
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);
    const offset = (page - 1) * limit;

    let categoryId: string | undefined;
    if (categorySlug) {
      const categoryRow = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      });
      /* Unknown/renamed category slug in the URL = treat as "no results" rather than a 400/500, since this is usally a stale bookmark or shared link rather than a client bug. */
      if (!categoryRow) {
        res.json({
          products: [],
          pagination: { page: page, limit: limit, total: 0, totalPages: 1 },
        });
        return;
      }
      categoryId = categoryRow.id;
    }

    const baseConditions = [eq(products.active, true)];
    if (categoryId) {
      baseConditions.push(eq(products.categoryId, categoryId));
    }
    const baseWhere =
      baseConditions.length > 1 ? and(...baseConditions) : baseConditions[0];
    const featuredWhere = featuredOnly
      ? and(...baseConditions, eq(products.isFeatured, true))
      : baseWhere;

    const runQuery = async (whereClause: typeof baseWhere) => {
      return Promise.all([
        db.query.products.findMany({
          where: whereClause,
          orderBy: desc(products.createdAt),
          limit: limit,
          offset: offset,
          with: {
            images: { orderBy: asc(productImages.order) },
            category: true,
          },
        }),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(products)
          .where(whereClause),
      ]);
    };

    let [rows, [{ count }]] = await runQuery(featuredWhere);

    /* Nothing has been marked isFeatured yet - fall back to newest active products rather than showing an empty "Featured products" section. Once products are actually flagged featured,  this stops firing. */

    if (featuredOnly && rows.length === 0) {
      [rows, [{ count }]] = await runQuery(baseWhere);
    }

    res.json({
      products: rows,
      pagination: {
        page: page,
        limit: limit,
        total: count,
        totalPages: Math.max(1, Math.ceil(count / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* GET CATEGORIES */
/* Was: SELECT DISTINCT category FROM products WHERE active - meaning a category only "existed" if some active product happened to reference it, and there was no way to curate order or create one ahead of any product. Now reads the categories table directly, so this list is independent of product counts and orderable - exactly what an admin "manage categories" form (coming from the admin CRUD work) needs to operate on.  */
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = await db.query.categories.findMany({
      where: eq(categories.active, true),
      orderBy: asc(categories.displayOrder),
    });
    res.json({ categories: rows });
  } catch (event) {
    next(event);
  }
};

/* GET PRODUCT BY SLUG */
export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const row = await db.query.products.findFirst({
      where: eq(products.slug, req.params.slug as string),
      with: {
        images: {
          orderBy: asc(productImages.order),
        },
        category: true,
      },
    });

    if (!row || !row.active) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ product: row });
  } catch (event) {
    next(event);
  }
};

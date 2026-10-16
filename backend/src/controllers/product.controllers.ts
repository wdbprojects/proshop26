import { NextFunction, Request, Response } from "express";
import { db } from "../drizzle/db";
import { categories, productImages, products } from "../drizzle/schema";
import {
  asc,
  desc,
  eq,
  and,
  sql,
  inArray,
  gte,
  lte,
  isNotNull,
  ilike,
  or,
  type SQL,
} from "drizzle-orm";
import { escapeLike, tokenize, truncateText } from "../lib/utils";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 48;
const SUGGEST_LIMIT = 8;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

const parsePositiveInt = (value: unknown, fallback: number, max?: number) => {
  const num = typeof value === "string" ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return max ? Math.min(num, max) : num;
};

const parseOptionalNonNegativeInt = (value: unknown): number | undefined => {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const num = parseInt(value, 10);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
};

const parseBrandFilter = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.length > 0) {
    return value
      .split(",")
      .map((b) => {
        return b.trim();
      })
      .filter(Boolean);
  }
  return [];
};

const SORT_KEYS = [
  "relevance",
  "newest",
  "price_asc",
  "price_desc",
  "rating",
] as const;
type SortKey = (typeof SORT_KEYS)[number];

const parseSort = (value: unknown, hasQuery: boolean): SortKey => {
  const fallback: SortKey = hasQuery ? "relevance" : "newest";
  if (typeof value !== "string") return fallback;
  const match = SORT_KEYS.find((key) => {
    return key === value;
  });
  if (!match) return fallback;
  if (match === "relevance" && !hasQuery) return fallback;
  return match;
};

const buildOrderBy = (sort: SortKey, q: string): SQL[] => {
  switch (sort) {
    case "relevance":
      return [
        sql`ts_rank(search_vector, websearch_to_tsquery('english', ${q})) DESC`,
        sql`similarity(${products.name}, ${q} DESC)`,
        desc(products.createdAt),
        asc(products.id),
      ];
    case "price_asc":
      return [asc(products.priceCents), asc(products.id)];
    case "price_desc":
      return [desc(products.priceCents), asc(products.id)];
    case "rating":
      return [
        desc(products.rating),
        desc(products.numReviews),
        asc(products.id),
      ];
    default:
      return [desc(products.createdAt), asc(products.id)];
  }
};

/* GET ALL PRODUCTS */
/* Now also supports keyword search (?q=), brand filtering (?brand=), and a price range (?minPrice=/?maxPrice=, in cents), alongside the existing category/featured/pagination params. When ?q= is present, results rank by full-text relevance with a trigram fallback for typos;  facets (brand counts, price bounds) are computed against category+q only - narrowing by brand/price doesn't shrink the facet options themselves, which is the simpler "narrow as you go" pattern. A proper mutual-exclusion facet count (where picking a brand doesn't hide other brand's true counts) needs one query per facet dimension and is a reasonable v2 if the UX calls for it. */
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

    const q =
      typeof req.query.q === "string"
        ? req.query.q.trim().slice(0, MAX_QUERY_LENGTH)
        : "";

    const sort = parseSort(req.query.sort, Boolean(q));

    const brands = parseBrandFilter(req.query.brand);
    let minPriceCents = parseOptionalNonNegativeInt(req.query.minPrice);
    let maxPriceCents = parseOptionalNonNegativeInt(req.query.maxPrice);
    if (
      minPriceCents !== undefined &&
      maxPriceCents !== undefined &&
      minPriceCents > maxPriceCents
    ) {
      [minPriceCents, maxPriceCents] = [maxPriceCents, minPriceCents];
    }

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
    if (brands.length > 0) {
      baseConditions.push(inArray(products.brand, brands));
    }
    if (minPriceCents !== undefined) {
      baseConditions.push(gte(products.priceCents, minPriceCents));
    }
    if (maxPriceCents !== undefined) {
      baseConditions.push(lte(products.priceCents, maxPriceCents));
    }

    /* Full-text match OR trigram similarity fallback - the latter is what still returns results for a typo'd query that full-text (exact lexeme matching) would otherwise miss entirely */
    const tokens = tokenize(q);
    const searchCondition = q
      ? or(
          sql`search_vector @@ websearch_to_tsquery('english', ${q})`,
          /* partial words, anywhere in name/brand/description/category */
          and(
            ...tokens.map((token) => {
              const pattern = `%${escapeLike(token)}%`;
              return or(
                ilike(products.name, pattern),
                ilike(products.brand, pattern),
                ilike(products.description, pattern),
                sql`exists (
                select 1 from categories c
                where c.id = products.category_id
                and c.name ilike ${pattern}
              )`,
              );
            }),
          ),
          sql`${products.name} % ${q}`,
        )
      : undefined;

    const allConditions = searchCondition
      ? [...baseConditions, searchCondition]
      : baseConditions;

    const baseWhere =
      allConditions.length > 1 ? and(...allConditions) : allConditions[0];

    const featuredWhere = featuredOnly
      ? and(...baseConditions, eq(products.isFeatured, true))
      : baseWhere;

    const runQuery = async (whereClause: typeof baseWhere) => {
      const [idRows, [{ count }]] = await Promise.all([
        db
          .select({ id: products.id })
          .from(products)
          .where(whereClause)
          .orderBy(...buildOrderBy(sort, q))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(products)
          .where(whereClause),
      ]);
      const ids = idRows.map((row) => {
        return row.id;
      });
      if (ids.length === 0) {
        return { rows: [], count: count };
      }
      const fullRows = await db.query.products.findMany({
        where: inArray(products.id, ids),
        with: {
          images: { orderBy: asc(productImages.order) },
          category: true,
        },
      });
      const byId = new Map(
        fullRows.map((row) => {
          return [row.id, row];
        }),
      );
      const rows = ids
        .map((id) => {
          return byId.get(id);
        })
        .filter((row): row is (typeof fullRows)[number] => {
          return Boolean(row);
        });
      return { rows: rows, count: count };
    };

    let { rows, count } = await runQuery(featuredWhere);

    /* Nothing has been marked isFeatured yet - fall back to newest active products rather than showing an empty "Featured products" section. Once products are actually flagged featured,  this stops firing. */

    if (featuredOnly && rows.length === 0) {
      ({ rows, count } = await runQuery(baseWhere));
    }

    /* Facets deliberately ignore brand/price so the filter panel doesn't collapse its own options when a filter is applied - only category + q narrow what's offered. */
    const facetWhere =
      allConditions.length > 1 ? and(...allConditions) : allConditions[0];
    const [brandRows, [priceBounds]] = await Promise.all([
      db
        .select({ brand: products.brand, count: sql<number>`count(*)::int` })
        .from(products)
        .where(and(facetWhere, isNotNull(products.brand)))
        .groupBy(products.brand)
        .orderBy(desc(sql`count(*)`)),
      db
        .select({
          min: sql<number>`coalesce(min(${products.priceCents}), 0)::int`,
          max: sql<number>`coalesce(max(${products.priceCents}), 0)::int`,
        })
        .from(products)
        .where(facetWhere),
    ]);

    res.json({
      products: rows,
      pagination: {
        page: page,
        limit: limit,
        total: count,
        totalPages: Math.max(1, Math.ceil(count / limit)),
      },
      facets: {
        brands: brandRows.map((row) => {
          return { brand: row.brand, count: row.count };
        }),
        price: { min: priceBounds?.min ?? 0, max: priceBounds?.max ?? 0 },
      },
    });
  } catch (err) {
    next(err);
  }
};

/* INSTANT SEARCH SUGGESTIONS (as-you-type dropdown) */
/* Small, fast, typo/prefix-tolerant. Not ranked results-page relevance - just "does this look like what they're typing" so it leans on trigram matching rather than full-text search. */

export const suggestProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q =
      typeof req.query.q === "string"
        ? req.query.q.trim().slice(0, MAX_QUERY_LENGTH)
        : "";

    if (q.length < MIN_QUERY_LENGTH) {
      res.json({ suggestions: [] });
      return;
    }

    const tokens = tokenize(q);
    const prefixPattern = `${escapeLike(q)}%`;
    const containsPattern = `%${escapeLike(q)}%`;

    const tokenMatch = and(
      ...tokens.map((token) => {
        const pattern = `%${escapeLike(token)}%`;
        return or(
          ilike(products.name, pattern),
          ilike(products.brand, pattern),
          ilike(products.description, pattern),
          ilike(categories.name, pattern),
        );
      }),
    );

    const rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        description: products.description,
        priceCents: products.priceCents,
        currency: products.currency,
        thumbnail: sql<string | null>`(
        select pi.url from product_images pi
        where pi.product_id = "products"."id"
        order by pi.is_primary desc, pi."order" asc
        limit 1
      )`,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.active, true),
          /* word match OR trigram (keep typo tolerance, e.g. "wireless") */
          // sql`(${products.name} ilike ${prefixPattern} OR ${products.name} % ${q})`,
          or(tokenMatch, sql`${products.name} % ${q}`),
        ),
      )
      .orderBy(
        sql`(${products.name} ilike ${prefixPattern}) DESC`,
        sql`(${products.name} ilike ${containsPattern}) DESC`,
        sql`similarity(${products.name}, ${q}) DESC`,
      )
      .limit(SUGGEST_LIMIT);

    const suggestions = rows.map((row) => {
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        shortDescription: truncateText(row.description, 100),
        thumbnail: row.thumbnail,
        priceCents: row.priceCents,
        currency: row.currency,
      };
    });

    res.json({ suggestions: suggestions });
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

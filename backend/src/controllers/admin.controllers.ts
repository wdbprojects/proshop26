import { NextFunction, Request, Response } from "express";
import ImageKit from "@imagekit/nodejs";
import { orderItems, productImages, products } from "../drizzle/schema";
import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "../drizzle/db";
import {
  buildProductUpdateSet,
  deleteImageKitAsset,
  isForeignKeyViolation,
  isUniqueViolation,
  getPgErrorCode,
} from "../lib/utils";
import { getEnv } from "../config/env";
import { ApiError } from "../lib/api-error";
import {
  productCreateSchema,
  productIdParamSchema,
  productUpdateSchema,
} from "../validators/product.validators";
import { isPrimary } from "node:cluster";

const ENV = getEnv();
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePositiveInt = (value: unknown, fallback: number, max?: number) => {
  const num = typeof value === "string" ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return max ? Math.min(num, max) : num;
};

/* Best-effort ImageKit cleanup. Always called AFTER the HTTP response has been sent, so a slow or failing third-party call can leave an orphaned asset but can never hang a request. */
const cleanupImageKitAssets = async (fileIds: string[], context: string) => {
  for (const fileId of fileIds) {
    try {
      await deleteImageKitAsset(ENV, fileId);
    } catch (cleanupErr) {
      console.error(
        `Failed to delete ImageKit asset ${fileId} (${context}):`,
        cleanupErr,
      );
    }
  }
};

/* IMAGE KIT AUTH ENDPOINT */
export const getImageKitAuth = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const client = new ImageKit({ privateKey: ENV.IMAGEKIT_PRIVATE_KEY });
    const auth = client.helper.getAuthenticationParameters();
    res.json({
      ...auth,
      publicKey: ENV.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: ENV.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (error) {
    next(error);
  }
};

/* DELETE AN UPLOADED-BUT-NOT-YET-SAVED IMAGE FROM IMAGEKIT
  Not scoped to any product - this covers the case where an admin uploads an image while building a product, then removes it before even saving, so it never becomes a product_images row at all. */
export const deleteProductImageUpload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const imageKitFileId = req.params.fileId;
    if (!imageKitFileId) {
      throw new ApiError(400, "Missing ImageKit file id");
    }
  } catch (err) {
    next(err);
  }
};

/* LIST ALL PRODUCTS (paginated, with images + category, admin filters) */

export const listAdminProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);
    const offset = (page - 1) * limit;

    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const categoryId =
      typeof req.query.categoryId === "string"
        ? req.query.categoryId
        : undefined;
    const activeFilter =
      req.query.active === "true"
        ? true
        : req.query.active === "false"
          ? false
          : undefined;

    const conditions = [];
    if (search) conditions.push(ilike(products.name, `%${search}%`));
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));
    if (activeFilter !== undefined)
      conditions.push(eq(products.active, activeFilter));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db.query.products.findMany({
        where: where,
        orderBy: desc(products.createdAt),
        limit: limit,
        offset: offset,
        with: {
          images: { orderBy: asc(productImages.order) },
          category: true,
        },
      }),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(products)
        .where(where),
    ]);
    res.json({
      products: rows,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* CREATE PRODUCT */
export const createAdminProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = productCreateSchema.parse(req.body);
    const { images, ...productFields } = parsed;
    const created = await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values(productFields)
        .returning();

      await tx.insert(productImages).values(
        images.map((image, index) => {
          return {
            productId: product.id,
            url: image.url,
            imageKitFileId: image.imageKitFileId,
            alt: image.alt ?? null,
            order: index,
            isPrimary: index === 0,
          };
        }),
      );
      return product;
    });

    const productWithRelations = await db.query.products.findFirst({
      where: eq(products.id, created.id),
      with: {
        images: { orderBy: asc(productImages.order) },
        category: true,
      },
    });

    res.status(201).json({ product: productWithRelations });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return next(new ApiError(409, "A product with this slug already exists"));
    }
    if (isForeignKeyViolation(err)) {
      return next(new ApiError(400, "Invalid category"));
    }
    next(err);
  }
};

/* UPDATE PRODUCT */
export const updateAdminProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = productIdParamSchema.parse(req.params);
    const parsed = productUpdateSchema.parse(req.body);
    const { images, ...scalarFields } = parsed;
    const data = buildProductUpdateSet(scalarFields);

    if (Object.keys(data).length === 0 && images === undefined) {
      throw new ApiError(400, "No fields to update");
    }

    let removedImageKitFileIds: string[] = [];

    const updated = await db.transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        const [row] = await tx
          .update(products)
          .set(data)
          .where(eq(products.id, id))
          .returning({ id: products.id });

        if (!row) {
          throw new ApiError(404, "Product not found");
        }
      } else {
        const [existing] = await tx
          .select({ id: products.id })
          .from(products)
          .where(eq(products.id, id))
          .limit(1);
        if (!existing) {
          throw new ApiError(404, "Product not found");
        }
      }

      if (images !== undefined) {
        const existingImages = await tx.query.productImages.findMany({
          where: eq(productImages.productId, id),
        });
        const existingIds = new Set(
          existingImages.map((image) => {
            return image.id;
          }),
        );
        const keptIds = new Set(
          images
            .filter((image) => {
              return image.id;
            })
            .map((image) => {
              return image.id;
            }),
        );
        const idsToRemove = existingImages
          .filter((image) => {
            return !keptIds.has(image.id);
          })
          .map((image) => {
            return image.id;
          });

        /* Unset every row's primary flag first - product_images has a partial unique index allowing only one isPrimary=true row per product, checked per-statement (not deferred). Updating rows one at a time without this step could transiently try to set a new primary while the old one is still true and violate it.  */
        await tx
          .update(productImages)
          .set({ isPrimary: false })
          .where(eq(productImages.productId, id));

        if (idsToRemove.length > 0) {
          await tx
            .delete(productImages)
            .where(inArray(productImages.id, idsToRemove));
        }

        for (let index = 0; index < images.length; index++) {
          const image = images[index];
          const primary = index === 0;
          if (image.id && existingIds.has(image.id)) {
            await tx
              .update(productImages)
              .set({
                alt: image.alt ?? null,
                order: index,
                isPrimary: primary,
              })
              .where(eq(productImages.id, image.id));
          } else {
            await tx.insert(productImages).values({
              productId: id,
              url: image.url,
              imageKitFileId: image.imageKitFileId,
              alt: image.alt ?? null,
              order: index,
              isPrimary: primary,
            });
          }
        }

        removedImageKitFileIds = existingImages
          .filter((image) => {
            return idsToRemove.includes(image.id) && image.imageKitFileId;
          })
          .map((image) => {
            return image.imageKitFileId as string;
          });
      }
      return tx.query.products.findFirst({
        where: eq(products.id, id),
        with: {
          images: { orderBy: asc(productImages.order) },
          category: true,
        },
      });
    });

    res.status(200).json({
      message: "Product updated successfully",
      product: updated,
    });

    /* After the response and after the commit: a failed or slow ImageKit delete leaves an orphaned asset, never a hung request or a rolled-back DB change. */
    void cleanupImageKitAssets(
      removedImageKitFileIds,
      `product ${req.params.id}`,
    );
  } catch (err) {
    /* Every path out of this block must end in a next() call - an error that matches none of the branches below and isn't forwarded leaves the request without any response, which hangs the client forever with nothing lagged. */
    const pgCode = getPgErrorCode(err);
    if (pgCode === "55P03" || pgCode === "57014") {
      return next(
        new ApiError(
          503,
          "This product is being modified by another request. Please try again in a moment",
        ),
      );
    }
    if (isUniqueViolation(err, "product_images_one_primary_idx")) {
      return next(
        new ApiError(409, "Could not update product images. Please try again"),
      );
    }
    if (isUniqueViolation(err)) {
      return next(new ApiError(409, "A product with this slug already exists"));
    }
    if (isForeignKeyViolation(err)) {
      return next(new ApiError(400, "Invalid category"));
    }
    next(err);
  }
};

/* DELETE PRODUCT */
export const deleteAdminProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = productIdParamSchema.parse(req.params);

    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!existing) {
      throw new ApiError(404, "Product not found");
    }

    const [{ orderCount }] = await db
      .select({ orderCount: count() })
      .from(orderItems)
      .where(eq(orderItems.productId, id));
    if (Number(orderCount) > 0) {
      throw new ApiError(
        409,
        "This product is on one or more orders and cannot be deleted. Deactivate it instead",
      );
    }

    const images = await db.query.productImages.findMany({
      where: eq(productImages.productId, id),
    });

    // product_images cascade-deletes with the product (FK onDelete: cascade)
    await db.delete(products).where(eq(products.id, id));

    for (const image of images) {
      if (!image.imageKitFileId) continue;
      try {
        await deleteImageKitAsset(ENV, image.imageKitFileId);
      } catch (cleanupErr) {
        console.error(
          `Failed to delete ImageKit asset ${image.imageKitFileId} for product ${id}`,
          cleanupErr,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

/* GET PRODUCT BY ID */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = productIdParamSchema.parse(req.params);
    const row = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        images: { orderBy: asc(productImages.order) },
        category: true,
      },
    });
    if (!row) {
      throw new ApiError(404, "Product not found");
    }
    res.json({ product: row });
  } catch (err) {
    next(err);
  }
};

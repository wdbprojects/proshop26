import { NextFunction, Request, Response } from "express";
import ImageKit from "@imagekit/nodejs";
import { orderItems, products } from "../drizzle/schema";
import { count, desc, eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import {
  productCreateSchema,
  productUpdateSchema,
} from "../config/type-schemas";
import { buildProductUpdateSet, deleteImageKitAsset } from "../lib/utils";
import { getEnv } from "../config/env";

const ENV = getEnv();

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

/* UPLOAD IMAGE TO IMAGEKIT (AVOID CORS) */
// export const uploadImageToImageKit = async () => {};

/* LIST ALL PRODUCTS */
export const listAdminProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));
    res.json({ products: rows });
  } catch (error) {
    next(error);
  }
};

/* CREATE PRODUCT */
export const createAdminProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = productCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const { imageUrl, imageKitFileId, ...rest } = parsed.data;
    const [row] = await db
      .insert(products)
      .values({
        ...rest,
        imageUrl: imageUrl || null,
        imageKitFileId: imageKitFileId || null,
      })
      .returning();
    res.status(201).json({ product: row });
  } catch (error) {
    next(error);
  }
};

/* UPDATE PRODUCT */
export const updateAdminProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = productUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const data = buildProductUpdateSet(parsed.data);
    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    const [row] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, req.params.id as string))
      .returning();

    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(201).json({
      message: "Product updated successfully!!",
      product: row,
    });
  } catch (error) {
    next(error);
  }
};

/* DELETE PRODUCT */
export const deleteAdminProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const [countRow] = await db
      .select({ count: count() })
      .from(orderItems)
      .where(eq(orderItems.productId, id));
    if (Number(countRow?.count ?? 0) > 0) {
      res.status(409).json({
        error:
          "This product is on one or more orders and cannot be deleted. Deactivate it instead.",
      });
      return;
    }
    await deleteImageKitAsset(ENV, existing.imageKitFileId);
    await db.delete(products).where(eq(products.id, id));
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/* DELETE IMAGES */
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    // get the product to check if it exists and get the fileId
    const [existing] = await db
      .select({
        id: products.id,
        imageKitFileId: products.imageKitFileId,
        imageUrl: products.imageUrl,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // check if there's actually an image to delete
    if (!existing.imageKitFileId) {
      res.status(400).json({
        error: "This product doesn't have an associated image to delete",
      });
      return;
    }

    // delete the image from imagejkit
    await deleteImageKitAsset(ENV, existing.imageKitFileId);

    // Update the product to remove image references
    await db
      .update(products)
      .set({ imageUrl: null, imageKitFileId: null })
      .where(eq(products.id, id));

    // update the product record to remove the image references
    res.status(200).json({
      success: true,
      message: "Image deleted successfully from ImageKit",
    });
  } catch (err) {
    next(err);
  }
};

/* DELETE IMAGES FROM IMAGEKIT ONLY */
export const deleteProductImageUpload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const imageKitFileId = req.params.id as string;

    // check if there's actually an image to delete
    if (!imageKitFileId) {
      res.status(400).json({
        error: "There is no image in ImageKit with that ID",
      });
      return;
    }

    // delete the image from imagejkit
    await deleteImageKitAsset(ENV, imageKitFileId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully from ImageKit",
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
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.id, req.params.id as string))
      .limit(1);
    if (!row) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ product: row });
  } catch (event) {
    next(event);
  }
};

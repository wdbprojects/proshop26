import z from "zod";

import { productUpdateSchema } from "../validators/product.validators";
import { products } from "../drizzle/schema";
import { Env } from "../config/env";
import ImageKit from "@imagekit/nodejs";
import { NotFoundError } from "@imagekit/nodejs";

/* Only the scalar product columns - `images` is handled separately (product_images has its own insert/update/delete diffing), never passed through here. */
export const buildProductUpdateSet = (
  body: Omit<z.infer<typeof productUpdateSchema>, "images">,
) => {
  const data: Partial<typeof products.$inferInsert> = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;
  if (body.brand !== undefined) data.brand = body.brand;
  if (body.description !== undefined) data.description = body.description;
  if (body.longDescription !== undefined)
    data.longDescription = body.longDescription;
  if (body.stock !== undefined) data.stock = body.stock;
  if (body.priceCents !== undefined) data.priceCents = body.priceCents;
  if (body.currency !== undefined) data.currency = body.currency;
  if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;
  if (body.active !== undefined) data.active = body.active;
  return data;
};

export async function deleteImageKitAsset(
  ENV: Env,
  storedFileId: string | null,
) {
  if (!storedFileId) return;
  const client = new ImageKit({ privateKey: ENV.IMAGEKIT_PRIVATE_KEY });
  try {
    await client.files.delete(storedFileId);
  } catch (error: unknown) {
    if (error instanceof NotFoundError) return;
    throw error;
  }
}

/* Postgres error codes surfaced via `.code` on the thrown error - this convention holds for both the `pg` driver and postgres.js, but if your drizzle/db.ts uses something else, verify this still fires (test: try creating two products with the same slug, confirm you get a 409 and not a waw 500) */
type PgErrorLike = { code?: string; constraint?: string; cause?: unknown };

export const getPgError = (err: unknown): PgErrorLike | undefined => {
  let current: unknown = err;
  for (let depth = 0; depth < 5 && current; depth++) {
    const candidate = current as PgErrorLike;
    if (typeof candidate.code === "string") return candidate;
    current = candidate.cause;
  }
  return undefined;
};
export const getPgErrorCode = (err: unknown): string | undefined => {
  return getPgError(err)?.code;
};

export const isUniqueViolation = (
  err: unknown,
  constraint?: string,
): boolean => {
  const pgErr = getPgError(err);
  if (pgErr?.code !== "23505") return false;
  return constraint ? pgErr.constraint === constraint : true;
};

export const isForeignKeyViolation = (err: unknown): boolean => {
  return (err as PgErrorLike)?.code === "23503";
};

/* format number with decimal places */
export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
};

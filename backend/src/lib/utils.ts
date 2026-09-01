import z from "zod";
import { productUpdateSchema } from "../config/type-schemas";
import { products } from "../drizzle/schema";
import { Env } from "../config/env";
import ImageKit from "@imagekit/nodejs";
import { NotFoundError } from "@imagekit/nodejs";

export const buildProductUpdateSet = (
  body: z.infer<typeof productUpdateSchema>,
) => {
  const data: Partial<typeof products.$inferInsert> = {};
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.name !== undefined) data.name = body.name;
  if (body.category !== undefined) data.category = body.category;
  if (body.description !== undefined) data.description = body.description;
  if (body.priceCents !== undefined) data.priceCents = body.priceCents;
  if (body.currency !== undefined) data.currency = body.currency;
  // if (body.imageUrl !== undefined)
  //   data.imageUrl = body.imageUrl === "" ? null : body.imageUrl;
  // if (body.imageKitFileId !== undefined)
  //   data.imageKitFileId =
  //     body.imageKitFileId === "" ? null : body.imageKitFileId;
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

/* format number with decimal places */
export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
};

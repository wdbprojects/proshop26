import {
  boolean,
  integer,
  pgTable,
  text,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { products } from "./products.schema";

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    isPrimary: boolean("is_primary").default(false).notNull(),
    order: integer("order").default(0).notNull(),
    imageKitFileId: text("image_kit_file_id"),
  },
  (table) => ({
    productIdIdx: index("product_images_product_id_idx").on(table.productId),
    onePrimaryPerProduct: uniqueIndex("product_images_one_primary_idx")
      .on(table.productId)
      .where(sql`${table.isPrimary} = true`),
  }),
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

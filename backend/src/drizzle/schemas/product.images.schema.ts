import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products.schema";

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: text().notNull(),
  url: text("url").notNull(),
  alt: text("alt"),
  order: integer("order").default(0),
  isPrimary: boolean("is_primary").default(false),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

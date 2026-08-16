import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  decimal,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { orderItems } from "./orderItems.schema";
import { productImages } from "./product.images.schema";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull().default("General"),
  images: text("images").array(),
  brand: text("brand"),
  description: text("description").notNull().default(""),
  stock: integer(),
  priceCents: integer("price_cents"),
  price: numeric("price", { precision: 10, scale: 2 }).default("0.00"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0.00"),
  numReviews: integer().default(0),
  isFeatured: boolean().default(false),
  banner: text(),
  currency: text("currency").notNull().default("usd"),
  imageUrl: text("image_url"),
  imageKitFileId: text("image_kit_file_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* RELATIONS */
export const productRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  images: many(productImages),
}));

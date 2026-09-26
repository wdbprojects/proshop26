import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { orderItems } from "./orderItems.schema";
import { productImages } from "./product.images.schema";
import { categories } from "./categories.schema";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    brand: text("brand"),
    description: text("description").notNull().default(""),
    longDescription: text("long_description").notNull().default(""),
    stock: integer("stock").notNull().default(0),
    priceCents: integer("price_cents").notNull().default(0),
    currency: text("currency").notNull().default("usd"),
    rating: numeric("rating", { precision: 3, scale: 2 })
      .notNull()
      .default("0.00"),
    numReviews: integer("num_reviews").notNull().default(0),
    isFeatured: boolean("is_featured").notNull().default(false),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    categoryIdx: index("products_category_idx").on(table.categoryId),
    brandIdx: index("products_brand_idx").on(table.brand),
    activeIdx: index("products_active_idx").on(table.active),
    isFeaturedIdx: index("products_id_featured_idx").on(table.isFeatured),
  }),
);

/* RELATIONS */
export const productRelations = relations(products, ({ one, many }) => ({
  orderItems: many(orderItems),
  images: many(productImages),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

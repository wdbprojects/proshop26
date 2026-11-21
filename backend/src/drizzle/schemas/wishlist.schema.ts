import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { products } from "./products.schema";
import { relations } from "drizzle-orm";

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // one row per user and product; it also covers lookups by userId
    uniqueIndex("wishlist_user_product_idx").on(table.userId, table.productId),
  ],
);

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => {
  return {
    user: one(user, { fields: [wishlistItems.userId], references: [user.id] }),
    product: one(products, {
      fields: [wishlistItems.productId],
      references: [products.id],
    }),
  };
});

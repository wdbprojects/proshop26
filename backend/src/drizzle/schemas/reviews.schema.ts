import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { products } from "./products.schema";
import { relations, sql } from "drizzle-orm";

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(
        () => {
          return user.id;
        },
        { onDelete: "cascade" },
      ),
    productId: uuid("product_id")
      .notNull()
      .references(
        () => {
          return products.id;
        },
        { onDelete: "cascade" },
      ),
    rating: integer("rating").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => {
        return new Date();
      }),
  },
  (table) => [
    uniqueIndex("reviews_user_product_idx").on(table.userId, table.productId),
    index("reviews_product_id_idx").on(table.productId),
    check("reviews_rating_range", sql`${table.rating} between 1 and 5`),
  ],
);

export const reviewsRelations = relations(reviews, ({ one }) => {
  return {
    user: one(user, { fields: [reviews.userId], references: [user.id] }),
    product: one(products, {
      fields: [reviews.productId],
      references: [products.id],
    }),
  };
});

import {
  pgTable,
  uuid,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { cart } from "./cart.schema";
import { products } from "./products.schema";
import {} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => cart.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    priceCentsAtAdd: integer("price_cents_at_add").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    cartProductIdx: uniqueIndex("cart_item_cart_product_idx").on(
      table.cartId,
      table.productId,
    ),
    cartIdIdx: index("cart_item_cart_id_idx").on(table.cartId),
  }),
);

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(cart, { fields: [cartItems.cartId], references: [cart.id] }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

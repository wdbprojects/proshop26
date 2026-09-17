import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { relations } from "drizzle-orm";
import { cartItems } from "./cart.items.schema";

export const cart = pgTable(
  "cart",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    sessionCartId: text("session_cart_id"),
    itemsPriceCents: integer("items_price_cents").notNull().default(0),
    totalPriceCents: integer("total_price_cents").notNull().default(0),
    shippingPriceCents: integer("shipping_price_cents").notNull().default(0),
    taxPriceCents: integer("tax_price_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("cart_user_is_idx").on(table.userId),
    sessionCartIdIdx: uniqueIndex("cart_session_cart_id_idx").on(
      table.sessionCartId,
    ),
  }),
);

/* RELATIONS */
export const cartRelations = relations(cart, ({ one, many }) => ({
  user: one(user, { fields: [cart.userId], references: [user.id] }),
  items: many(cartItems),
}));

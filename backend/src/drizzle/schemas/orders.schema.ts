import {
  integer,
  pgTable,
  text,
  uuid,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orderItems } from "./orderItems.schema";

export type OrderStatus = "pending" | "paid" | "failed";

/* Polar is the only provider wired up today. "qr_bolivia is added to the union now (schema-only) so the column type, the unique index, and every switch/if on paymentProvider are already shaped for a second provider. No QR integration code exists yet - this is purely so adding it later is a new case, not a migration." */
export type PaymentProvider = "polar" | "qr_bolivia";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    paymentProvider: text("payment_provider")
      .$type<PaymentProvider>()
      .notNull()
      .default("polar"),
    providerCheckoutId: text("provider_checkout_id"),
    providerOrderId: text("provider_order_id"),
    /* Anything provider-specific worth keeping (raw webhook payload, bank reference number, QR payment id) without adding a new column every time a new provider ships. */
    providerReference: jsonb("provider_reference"),
    totalCents: integer("total_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    /* Scoped per provider so a Polar id and a future QR id can never collide, and so "has this already been processed" checks stay provider-aware. Postgres unique indexes allow multiple NULLs, so orders without a providerOrderId yet (shouldn't normally happen, but defensively) don't fight each other. */
    providerOrderIdx: uniqueIndex("orders_provider_order_idx").on(
      table.paymentProvider,
      table.providerOrderId,
    ),
  }),
);

/* RELATIONS */
export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(user, { fields: [orders.userId], references: [user.id] }),
  items: many(orderItems),
}));

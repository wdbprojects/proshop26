import {
  pgTable,
  uuid,
  text,
  jsonb,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { PaymentProvider } from "./orders.schema";
import { uniqueIndex } from "drizzle-orm/pg-core";

export type CheckoutSessionLine = {
  productId: string;
  quantity: number;
  unitPriceCents: number;
};

export const checkoutSession = pgTable(
  "checkout_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    paymentProvider: text("payment_provider")
      .$type<PaymentProvider>()
      .notNull()
      .default("polar"),
    /* widened to text since a future provider's checkout/payment-request id isn't guaranteed to be uuid-shaped, and scoped by provider instead of a bare .unique() so a second provider's id space can't collide with Polar's */
    providerCheckoutId: text("provider_checkout_id"),
    lines: jsonb("lines").$type<CheckoutSessionLine[]>().notNull(),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    providerCheckoutIdx: uniqueIndex(
      "checkout_sessions_provider_checkout_idx",
    ).on(table.paymentProvider, table.providerCheckoutId),
  }),
);

import {
  text,
  uuid,
  pgTable,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { sql } from "drizzle-orm";

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: text("label"),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    city: text("city").notNull(),
    zone: text("zone"),
    street: text("street"),
    reference: text("reference"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("addresses_user_id_idx").on(table.userId),
    // at most one default per user, enforced by the database (same trick as product_images_one_primary_idx)
    uniqueIndex("addresses_one_default_idx")
      .on(table.userId)
      .where(sql`${table.isDefault} = true`),
  ],
);

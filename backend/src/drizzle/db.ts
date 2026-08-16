import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { getEnv } from "../config/env";

const ENV = getEnv();

export const db = drizzle(ENV.DATABASE_URL, { schema: schema });

if (db) {
  console.log("Database connection stablished correctly ☘️");
} else {
  console.error("Database connection error ⛔️");
}

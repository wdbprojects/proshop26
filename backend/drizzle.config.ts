import { defineConfig } from "drizzle-kit";
import { getEnv } from "./src/config/env";

const ENV = getEnv();

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: ENV.DATABASE_URL,
  },
});

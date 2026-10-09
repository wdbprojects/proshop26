import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../drizzle/db";
import { admin } from "better-auth/plugins";
import { getEnv } from "../config/env";
import { allowedOrigins } from "../config/origins";

const ENV = getEnv();

const isProduction = ENV.NODE_ENV === "production";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL: ENV.BETTER_AUTH_URL,
  secret: ENV.BETTER_AUTH_SECRET,
  trustedOrigins: allowedOrigins,
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      partitioned: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  plugins: [
    admin({
      defaultRole: "customer",
    }),
  ],
});

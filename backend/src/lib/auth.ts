import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../drizzle/db";
import { admin } from "better-auth/plugins";
import { getEnv } from "../config/env";

const ENV = getEnv();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseUrl: ENV.BETTER_AUTH_URL,
  secret: ENV.BETTER_AUTH_SECRET,
  trustedOrigins: [ENV.FRONTEND_URL],

  cookieOptions: {
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
    secure: true,
    httpOnly: true,
    path: "/",
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
      secure: true,
      httpOnly: true,
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

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
  baseURL: ENV.BETTER_AUTH_URL,
  secret: ENV.BETTER_AUTH_SECRET,
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: "proshop26-frontend.onrender.com",
    },
  },
  trustedOrigins: [
    ENV.FRONTEND_URL,
    "http://localhost:3000",
    "https://proshop26-frontend.onrender.com",
  ],
  cookies: {
    session_token: {
      name: "session_token",
      sameSite: "none",
      secure: true,
      httpOnly: true,
      path: "/",
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

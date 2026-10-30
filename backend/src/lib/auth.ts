import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../drizzle/db";
import { admin } from "better-auth/plugins";
import { getEnv } from "../config/env";
import { allowedOrigins } from "../config/origins";
import { resetPasswordTemplate, verifyEmailTemplate } from "./email-templates";
import { sendEmail } from "./email";

const ENV = getEnv();

const isProduction = ENV.NODE_ENV === "production";
const frontendUrl = (path: string, token: string) => {
  return `${ENV.FRONTEND_URL.replace(/\/+$/, "")}${path}?token=${encodeURIComponent(token)}`;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL: ENV.BETTER_AUTH_URL,
  secret: ENV.BETTER_AUTH_SECRET,
  trustedOrigins: allowedOrigins,
  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      partitioned: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, token }) => {
      const url = frontendUrl("/auth/reset-password", token);
      /* not awaited on purpose: waiting would make "email exists" requests slower than "doesn't exist" ones */
      void sendEmail({
        to: user.email,
        ...resetPasswordTemplate(user.name, url),
      }).catch((err: Error) => console.error("Reset email failed", err));
    },
  },
  ...(ENV.GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: ENV.GOOGLE_CLIENT_ID,
            clientSecret: ENV.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
  account: {
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, token }) => {
      const url = frontendUrl("/auth/verify-email", token);
      void sendEmail({
        to: user.email,
        ...verifyEmailTemplate(user.name, url),
      }).catch((err) => console.error("Verification email failed", err));
    },
  },
  plugins: [
    admin({
      defaultRole: "customer",
    }),
  ],
});

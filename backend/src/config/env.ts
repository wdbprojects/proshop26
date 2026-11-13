import { z } from "zod";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(5000),
    DATABASE_URL: z.string(),
    BETTER_AUTH_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    BASE_URL: z.string(),
    FRONTEND_URL: z.string().default("http://localhost:3000"),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    EMAIL_TEST_RECIPIENT: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),
    STREAM_API_KEY: z.string().min(1),
    STREAM_API_SECRET: z.string().min(1),
    IMAGEKIT_PUBLIC_KEY: z.string().min(1),
    IMAGEKIT_PRIVATE_KEY: z.string().min(1),
    IMAGEKIT_ID: z.string().min(1),
    IMAGEKIT_URL_ENDPOINT: z.string(),
    /* POLAR IMPLEMENTATION */
    POLAR_ACCESS_TOKEN: z.string().optional(),
    POLAR_WEBHOOK_SECRET: z.string().optional(),
    POLAR_API_BASE: z.string().url().default("https://sandbox-api.polar.sh"),
    POLAR_CHECKOUT_PRODUCT_ID: z.string().uuid(),
    /* BNB QR IMPLEMENTATION */
    BNB_MODE: z.enum(["live", "fake"]).default("live"),
    BNB_ACCOUNT_ID: z.string().optional(),
    BNB_AUTHORIZATION_ID: z.string().optional(),
    BNB_AUTH_BASE_URL: z
      .string()
      .url()
      .default("http://test.bnb.com.bo/ClientAuthentication.API/api/v1"),
    BNB_QR_BASE_URL: z
      .string()
      .url()
      .default("http://test.bnb.com.bo/QRSimple.API/api/v1"),
    // Header the bank sends with its notifications, and the exact value we expect. Unset VALUE = no check
    BNB_WEBHOOOK_AUTH_HEADER: z.string().default("authorization"),
    BNB_WWBHOOK_AUTH_VALUE: z.string().optional(),
    // While validating real payments, only admins can see QR checkout
    BNB_QR_ADMIN_ONLY: z.enum(["true", "false"]).default("false"),
  })
  .refine(
    (env) => !(env.NODE_ENV === "production" && env.BNB_MODE === "fake"),
    {
      message: "BNB_MODE=fake is not allowed when NODE_ENV=production",
      path: ["BNB_MODE"],
    },
  );
export type Env = z.infer<typeof envSchema>;

export function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

let cachedEnv: Env | null = null;
export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = loadEnv();
  }
  return cachedEnv;
}

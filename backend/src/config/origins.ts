import { getEnv } from "./env";

const ENV = getEnv();
const isProduction = ENV.NODE_ENV === "production";

const normalize = (origin: string) => {
  return origin.trim().replace(/\/+$/, "");
};

/* The one list of browser origins allowed to talk to this API. Consumed by: cors() in index.ts, trustedOrigins in lib/auth.ts, and middlewares/origin-guard.ts. Edit it here only. */

export const allowedOrigins = Array.from(
  new Set(
    [
      ENV.FRONTEND_URL,
      "https://proshop26-frontend.onrender.com",
      "https://proshop26.vercel.app",
      ...(isProduction ? [] : ["http://localhost:3000"]),
    ]
      .filter(Boolean)
      .map(normalize),
  ),
);

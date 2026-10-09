import { NextFunction, Request, Response } from "express";
import { allowedOrigins } from "./origins";

const allowed = new Set(allowedOrigins);
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/*
CSRF defense for a cookie-authenticated API (cookies are SameSite-None, so browsers attach them on cross-site requests). CORS alone doesn't cover this: it only tells the browser whether a page may READ a response. The server still processes the request, and a plain cross-site HTML form POST needs no CORS approval at all. This guard rejects those requests before any route or controller runs.
- Only state-changing methods are checked; GET/HEAD/OPTIONS pass through.
- Browsers always send an Origin header on cross-origin non-GET requests, so a present-but-untrusted (including the literal "null") is rejected.
- A missing Origin means a non-browser client (curl, server-to-server, webhooks). Those don't auto-attach cookies, so they can't be used for CSRF and are allowed through; they still have to pass requireAuth.
*/

export const originGuard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!STATE_CHANGING_METHODS.has(req.method)) return next();
  const origin = req.headers.origin;
  if (!origin) return next();
  if (allowed.has(origin)) return next();

  console.warn(`Blocked ${req.method} ${req.path} from origin: ${origin}`);
  return res.status(403).json({ error: "Origin not allowed" });
};

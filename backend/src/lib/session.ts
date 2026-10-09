import { IncomingHttpHeaders } from "node:http";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth";
import type { Session } from "../types/auth";

/* Fetches the current session for a request, or `null` if the caller is simply not authenticated. Deliberately does NOT swallow unexpected errors (DB down, better-auth missconfiguration, etc.) - those are rethrown so callers/middleware can return a 500 instead of silently treating an outage as "logged out". Only a genuinely missing session resolves to `null`.
`headers` should be the raw Node request headers (e.g. Express's `req.headers`) - `fromNodeHeaders` expects that shape, not the Fetch API `Headers` class. */

export const getCurrentSession = async (
  headers: IncomingHttpHeaders,
): Promise<Session | null> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(headers),
  });
  return (session as Session | null) ?? null;
};

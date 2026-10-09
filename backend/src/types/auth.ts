import type { auth } from "../lib/auth";

export type Session = typeof auth.$Infer.Session;

/* Augment Express's Request so `req.session` is typed everywhere once the auth middleware has run, without needing `as` casts at every call site */
declare global {
  namespace Express {
    interface Request {
      session?: Session;
    }
  }
}

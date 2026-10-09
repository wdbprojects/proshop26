import { NextFunction, Request, RequestHandler, Response } from "express";
import { getCurrentSession } from "../lib/session";
import { UserRole } from "../drizzle/schema";
import { isStaff } from "../lib/roles";

/* Verifies the request carries a valid session and attaches it to `req.session`. Does not check role - use `requireRole`/`requireAdmin` after this for role-gated routes. */

export const requireAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await getCurrentSession(req.headers);
    if (!session) {
      return res.status(401).json({ error: "Authentication required" });
    }
    req.session = session;
    next();
  } catch (err) {
    console.error("Session lookup failed", err);
    return res.status(500).json({ error: "Failed to verify authentication" });
  }
};

/* Exact-role gate factory. Must run after `requireAuth`:
  router.use(requireAuth, requireRole("admin"))
  Use this when a route needs one especific role and and nothing broader (e.g. product management is "admin" only, not staff/support. For "any staff member" checks, use `requireStaff instead so the definition of "staff" stays in one place (lib/roles/ts)`)
*/

export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = req.session;
    if (!session) {
      // defensive: only triggers if requireRole is used without requireAuth first
      return res.status(401).json({ error: "Athentication required!!" });
    }
    const role = session.user.role as UserRole | undefined;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Insufficient permission!!" });
    }
    next();
  };
};

/*
Any staff member gate - thin wrapper around the existing `isStaff` helper so route-level staff checks and the owner-or-staff checks already inside order.controllers.ts stay backed by the exact same definition of staff. Must run after `requireAuth`:
  router.post("/:id/video-invite", requireStaff, createVideoInvite)
Only use this for pure role gates with no ownership component. Checks like "owner OR staff" need the resource row first, so those stay inside the controller.
*/
export const requireStaff: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = req.session;
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!isStaff(session.user.role as UserRole)) {
    return res.status(403).json({ errr: "Insufficient permissions" });
  }
  next();
};

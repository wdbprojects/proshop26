import { Router } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

const router = Router();

router.get("/get-session", async (req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  console.log("Cookie Header:", req.headers.cookie);
  console.log("Authorization Header:", req.headers.authorization);
  // next();
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      return res.status(200).json({ error: "No active session!!!" });
    }
    return res.json(session);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default router;

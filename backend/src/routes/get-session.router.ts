import { Router } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

const router = Router();

router.get("/get-session", async (req, res, next) => {
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

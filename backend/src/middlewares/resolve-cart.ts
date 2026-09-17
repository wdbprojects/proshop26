import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { randomUUID } from "crypto";

const CART_COOKIE_NAME = "cart_session_id";
const CART_COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

export interface CartContext {
  userId: string | null;
  sessionCartId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      cartContext?: CartContext;
    }
  }
}

export const resolveCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    const userId = session?.user?.id ?? null;
    let sessionCartId: string | null = req.cookies?.[CART_COOKIE_NAME] ?? null;

    if (!userId && !sessionCartId) {
      sessionCartId = randomUUID();
      res.cookie(CART_COOKIE_NAME, sessionCartId, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        partitioned: true,
        maxAge: CART_COOKIE_MAX_AGE_MS,
      });
    }

    req.cartContext = { userId, sessionCartId };
    next();
  } catch (error) {
    next(error);
  }
};

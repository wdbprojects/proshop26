import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { randomUUID } from "crypto";
import { mergeGuestCartIntoUserCart } from "../controllers/cart.controllers";

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

    /* the one moment a merge is needed: authenticated AND still carrying a guest cart cookie from before login. Runs once - after this, the cookie is cleared, so if can't fire again on the next request */
    if (userId && sessionCartId) {
      await mergeGuestCartIntoUserCart(sessionCartId, userId);
      res.clearCookie(CART_COOKIE_NAME, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        partitioned: true,
      });
      sessionCartId = null;
    }
    req.cartContext = { userId, sessionCartId };
    next();
  } catch (error) {
    next(error);
  }
};

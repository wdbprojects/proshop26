import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { randomUUID } from "crypto";
import { mergeGuestCartIntoUserCart } from "../controllers/cart.controllers";
import { getCurrentSession } from "../lib/session";

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
    /* If requireAuth already ran on this router (e.g. checkout.router.ts: requireAuth then resolveCart), req.session is already populated — reuse it instead of validating the session a second time. On cart.router.ts, which allows guest carts and never runs requireAuth, req.session is undefined here, so this falls back to looking the session up directly, same as before. */
    const session = req.session ?? (await getCurrentSession(req.headers));
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

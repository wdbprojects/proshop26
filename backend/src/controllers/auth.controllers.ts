import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { getCurrentSession } from "../lib/session";
import z from "zod";
import {
  emailOnlySchema,
  resetPasswordSchema,
  signUpSchema,
  tokenSchema,
} from "../validators/auth.validators";
import { getEnv } from "../config/env";
import { jwtVerify } from "jose";
import { user } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { db } from "../drizzle/db";

const ENV = getEnv();

const getErrorDetails = (err: unknown) => {
  const body =
    typeof err === "object" && err !== null && "body" in err
      ? (err as { body?: { message?: string; code?: string } }).body
      : undefined;

  return {
    message:
      body?.message ??
      (err instanceof Error ? err.message : undefined) ??
      "An unexpected error occurred",
    code: body?.code,
  };
};

const zodMessage = (err: unknown) => {
  return err instanceof z.ZodError ? err.issues[0]?.message : undefined;
};

/* GET SESSION CONTROLLER */
/* Optional-auth endpoint: "logged out" is a normal start, not an error, so it returns 200 with JSON `null` rather than 401 */
export const getSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await getCurrentSession(req.headers);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(session);
  } catch (err) {
    next(err);
  }
};

/* BETTER AUTH SIGN UP CONTROLLER */
export const signUpController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = signUpSchema.parse(req.body);
    await auth.api.signUpEmail({ body: { name, email, password } });
    return res.status(200).json({
      success: true,
      message: "User created. Check your email to verify your account",
    });
  } catch (err) {
    const invalid = zodMessage(err);
    if (invalid) {
      return res.status(400).json({ success: false, message: invalid });
    }
    const { message, code } = getErrorDetails(err);
    console.log(err);
    return res.status(400).json({
      success: false,
      message: message || "Registration failed",
      code,
    });
  }
};

/* BETTER AUTH SIGN IN CONTROLLER */
export const signInController = async (req: Request, res: Response) => {
  try {
    const response = await auth.api.signInEmail({
      body: {
        email: req.body.email,
        password: req.body.password,
      },
      headers: fromNodeHeaders(req.headers),
      asResponse: true,
    });
    // forward any set-cookie headers to the client browser
    if (response.ok) {
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        res.setHeader("set-cookie", setCookieHeader);
      }
      const data = await response.json();
      return res.status(200).json({
        success: true,
        response: data,
        message: "User logged in successfully!!",
      });
    } else {
      if (response.status === 403) {
        return res.status(403).json({
          success: false,
          code: "EMAIL_NOT_VERIFIED",
          message:
            "Please verify your email first. We sent you a new verification link",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (err) {
    const { message } = getErrorDetails(err);
    console.log(err);
    return res.status(400).json({
      success: false,
      message: message || "Internal Server Error!!!",
    });
  }
};

/* BETTER AUTH SIGN OUT CONTROLLER */
export const logoutController = async (req: Request, res: Response) => {
  try {
    const response = await auth.api.signOut({
      headers: fromNodeHeaders(req.headers),
      asResponse: true,
    });
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      res.setHeader("set-cookie", setCookieHeader);
    }
    return res.status(200).json({
      success: true,
      message: "User signed out successfully!!",
    });
  } catch (err) {
    const { message } = getErrorDetails(err);
    console.log(err);
    return res.status(400).json({
      success: false,
      message: message || "Sign out failed!!!",
    });
  }
};

/* POST  /api/auth/verify-email { token } */
export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const { token } = tokenSchema.parse(req.body);

    // Check the signature ourselves first, so the "already verified" answer can't be forged.
    let email: string | undefined;
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(ENV.BETTER_AUTH_SECRET),
      );
      email = typeof payload.email === "string" ? payload.email : undefined;
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired link" });
    }

    if (email) {
      const [row] = await db
        .select({ verified: user.emailVerified })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
      if (row?.verified) {
        return res.status(200).json({
          success: true,
          alreadyVerified: true,
          message: "Your email is already verified",
        });
      }
    }

    await auth.api.verifyEmail({ query: { token } });
    return res
      .status(200)
      .json({ success: true, message: "Email verified. You can log in now." });
  } catch (err) {
    const { message } = getErrorDetails(err);
    return res.status(400).json({
      success: false,
      message: zodMessage(err) ?? message ?? "Invalid or expired link",
    });
  }
};

/* POST /api/auth/resend-verification { email } */
export const resendVerificationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email } = emailOnlySchema.parse(req.body);
    await auth.api.sendVerificationEmail({ body: { email } });
  } catch (err) {
    const invalid = zodMessage(err);
    if (invalid) {
      return res.status(400).json({ success: false, message: invalid });
    }
    console.error(err);
  }
  return res.status(200).json({
    success: true,
    message: "If that account needs verification, we sent an link.",
  });
};

/* POST /api/auth/forgot-password { email } */
export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = emailOnlySchema.parse(req.body);
    await auth.api.requestPasswordReset({ body: { email } });
  } catch (err) {
    const invalid = zodMessage(err);
    if (invalid) {
      return res.status(400).json({ success: false, message: invalid });
    }
    console.error(err);
  }
  return res.status(200).json({
    success: true,
    message: "If an account exists for that email, we sent a reset link.",
  });
};

/* POST /api/auth/reset-password { token, password } */
export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    await auth.api.resetPassword({ body: { newPassword: password, token } });
    return res.status(200).json({
      success: true,
      message: "Password updated. You can log in now.",
    });
  } catch (err) {
    const { message } = getErrorDetails(err);
    return res.status(400).json({
      succcess: false,
      message: zodMessage(err) ?? message ?? "Invalid or expired link",
    });
  }
};

/* POST /api/auth/google - returns the Google consent URL; the browser then navigates to it */
export const googleSignInController = async (req: Request, res: Response) => {
  try {
    const frontend = ENV.FRONTEND_URL.replace(/\/+$/, "");
    const response = await auth.api.signInSocial({
      body: {
        provider: "google",
        callbackURL: `${frontend}/`,
        errorCallbackURL: `${frontend}/auth/login`,
        disableRedirect: true,
      },
      headers: fromNodeHeaders(req.headers),
      asResponse: true,
    });

    // BetterAuth sets a state cookie that the callback checks - it must reach the browser
    const cookies = response.headers.getSetCookie();
    if (cookies.length > 0) res.setHeader("set-cookie", cookies);

    const data = (await response.json()) as { url?: string };
    if (!response.ok || !data.url) {
      return res
        .status(400)
        .json({ success: false, message: "Google login is unavailable" });
    }
    return res.status(200).json({ success: true, url: data.url });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ success: false, message: "Google login is unavailable" });
  }
};

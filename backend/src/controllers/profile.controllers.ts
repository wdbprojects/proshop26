import { eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { account, user } from "../drizzle/schema";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/api-error";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "../validators/profile.validators";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

const getProviders = async (userId: string) => {
  const rows = await db
    .select({ providerId: account.providerId })
    .from(account)
    .where(eq(account.userId, userId));
  return rows.map((row) => {
    return row.providerId;
  });
};

/* GET /api/profile */
export const getProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const [profile] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!profile) {
      throw new ApiError(404, "User not found");
    }
    res.json({ profile: profile, providers: await getProviders(userId) });
  } catch (err) {
    next(err);
  }
};

/* PATCH /api/profile { name } */
export const updateProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const { name } = updateProfileSchema.parse(req.body);
    await db.update(user).set({ name: name }).where(eq(user.id, userId));
    res.json({ name: name });
  } catch (err) {
    next(err);
  }
};

/* POST /api/profile/change-password { currentPassword, newPassword } */
export const changePasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body,
    );

    const providers = await getProviders(userId);

    if (!providers.includes("credential")) {
      throw new ApiError(
        400,
        'Your account signs in with Google and has no password. Use "Forgot password"',
      );
    }

    const response = await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: fromNodeHeaders(req.headers),
      asResponse: true,
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        code?: string;
        message?: string;
      } | null;
      throw new ApiError(
        400,
        data?.code === "INVALID_PASSWORD"
          ? "Current password is incorrect"
          : (data?.message ?? "Couldn't change the password"),
      );
    }

    // Other sessions were deleted and a new one was issued for this device: the cookie must reach the browser
    const cookies = response.headers.getSetCookie();
    if (cookies.length > 0) {
      res.setHeader("set-cookie", cookies);
    }
    res.json({
      success: true,
      message: "Password updated. Your other devices were signed out",
    });
  } catch (err) {
    next(err);
  }
};

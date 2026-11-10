import { NextFunction, Request, Response } from "express";
import { eq, and, ne, sql, type SQL, desc, or, ilike } from "drizzle-orm";
import { db } from "../drizzle/db";
import { session as sessionTable, user } from "../drizzle/schema";
import { ApiError } from "../lib/api-error";
import {
  banUserSchema,
  listUsersQuerySchema,
  setRoleSchema,
  userIdParamSchema,
} from "../validators/user.validators";
import { escapeLike } from "../lib/utils";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const notBanned = sql`coalesce(${user.banned}, false) = false`;

const ensureNotSelf = (req: Request, targetId: string) => {
  if (req.session!.user.id === targetId) {
    throw new ApiError(400, "You can't change your own role or ban yourself");
  }
};

// locks every admin row first, so two admins demoting or banning each other at the same moment can't leave the store with one
const ensureAnotherAdmin = async (tx: Tx, targetId: string) => {
  await tx
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "admin"))
    .for("update");
  const others = await tx
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.role, "admin"), ne(user.id, targetId), notBanned))
    .limit(1);
  if (others.length === 0) {
    throw new ApiError(409, "There must always be at least one active admin");
  }
};

const loadTarget = async (tx: Tx, id: string) => {
  const [target] = await tx
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);
  if (!target) throw new ApiError(404, "User not found");
  return target;
};

// GET /api/admin/users
export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, q, role, status } = listUsersQuerySchema.parse(
      req.query,
    );
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (role) conditions.push(eq(user.role, role));
    if (status === "banned") conditions.push(eq(user.banned, true));
    if (status === "active") conditions.push(notBanned);
    if (q) {
      const pattern = `%${escapeLike(q)}%`;
      conditions.push(
        or(ilike(user.name, pattern), ilike(user.email, pattern))!,
      );
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          role: user.role,
          banned: user.banned,
          banReason: user.banReason,
          createdAt: user.createdAt,
          orderCount: sql<number>`(select count(*)::int from orders where orders.user_id = "users"."id")`,
        })
        .from(user)
        .where(where)
        .orderBy(desc(user.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(user)
        .where(where),
    ]);
    res.json({
      users: rows,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPage: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH - /api/admin/users/:id/role {role}
export const setUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const { role } = setRoleSchema.parse(req.body);
    ensureNotSelf(req, id);

    await db.transaction(async (tx) => {
      const target = await loadTarget(tx, id);
      if (target.role === "admin" && role !== "admin") {
        await ensureAnotherAdmin(tx, id);
      }
      await tx.update(user).set({ role: role }).where(eq(user.id, id));
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// POST - /api/admin/users/:id/ban {reason?} - also signs the user out everywhere
export const banUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const { reason } = banUserSchema.parse(req.body);
    ensureNotSelf(req, id);

    await db.transaction(async (tx) => {
      const target = await loadTarget(tx, id);
      if (target.role === "admin") {
        await ensureAnotherAdmin(tx, id);
      }
      await tx
        .update(user)
        .set({ banned: true, banReason: reason ?? null, banExpires: null })
        .where(eq(user.id, id));
      await tx.delete(sessionTable).where(eq(sessionTable.userId, id));
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// POST - /api/admin/users/:id/unban
export const unbanUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const [row] = await db
      .update(user)
      .set({ banned: false, banReason: null, banExpires: null })
      .where(eq(user.id, id))
      .returning({ id: user.id });
    if (!row) throw new ApiError(404, "User not found");
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

import z from "zod";

export const USER_ROLES = ["customer", "support", "admin"] as const;

export const userIdParamSchema = z.object({
  id: z.string().min(1, "Invalid user id"),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().trim().max(100).optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(["active", "banned"]).optional(),
});

export const setRoleSchema = z.object({ role: z.enum(USER_ROLES) });

export const banUserSchema = z.object({
  reason: z.string().trim().max(200).optional(),
});

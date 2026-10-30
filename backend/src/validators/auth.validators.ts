import z from "zod";

/* Better auth only enforces length, so the letter/number rule lives here */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Za-z]/, "Password must contain at least on letter")
  .regex(/\d/, "Password must contain at least one number");

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("A valid email is required"),
  password: passwordSchema,
});

export const emailOnlySchema = z.object({
  email: z.email("A valid email is required"),
});

export const tokenSchema = z.object({
  token: z.string().min(1, "Missing token"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Missing token"),
  password: passwordSchema,
});

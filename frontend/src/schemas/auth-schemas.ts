import { z } from "zod";

const passwordRule = z
  .string()
  .min(8, { message: "Passwords must be at least 8 characters" })
  .max(128, { message: "Passwords must be at most 128 characters" })
  .regex(/[A-Za-z]/, { message: "Include at least one letter" })
  .regex(/\d/, { message: "Include at least one number" });

export const registerSchema = z
  .object({
    name: z.string().nonempty({ message: "Name is required" }),
    email: z.email({ message: "A valid email is required" }),
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    { message: "Passwords don't match", path: ["confirmPassword"] },
  );
export type RegisterSchemaType = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "A valid email is required" }),
});
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => {
    return (
      data.password === data.confirmPassword,
      { message: "Passwords don't match", path: ["confirmPassword"] }
    );
  });
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

export const loginSchema = z.object({
  email: z.email({ message: "A valid email is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
});
export type LoginSchemaType = z.infer<typeof loginSchema>;

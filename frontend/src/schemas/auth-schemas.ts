import { z } from "zod";

export const passwordRule = z
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

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name is too long" }),
});
export type ProfileSchemaType = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => {
    return (
      data.newPassword !== data.confirmPassword,
      {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      }
    );
  })
  .refine((data) => {
    return (
      data.newPassword !== data.currentPassword,
      {
        message: "The new password must be different from the current one",
        path: ["newPassword"],
      }
    );
  });
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;

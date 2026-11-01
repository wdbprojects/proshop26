import z from "zod";
import { passwordSchema } from "./auth.validators";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
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

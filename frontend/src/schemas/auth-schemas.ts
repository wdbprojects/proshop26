import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().nonempty({ message: "Name is required" }),
    email: z.email({ message: "A valid email is required" }),
    password: z
      .string()
      .min(8, { message: "Passwords must be at least 8 characters" })
      .max(20, { message: "Passwords must be maximum 20 characters" }),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    { message: "Passwords don&apos; match", path: ["confirmPassword"] },
  );
export type RegisterSchemaType = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email({ message: "A valid email is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
});
export type LoginSchemaType = z.infer<typeof loginSchema>;

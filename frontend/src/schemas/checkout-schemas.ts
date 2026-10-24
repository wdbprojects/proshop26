import z from "zod";
export const shippingAddressSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: "Full name is required" })
      .max(100),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s-]{7,20}$/, { message: "Enter a valid phone number" }),
    city: z.string().trim().min(2, { message: "City is required" }).max(80),
    zone: z.string().trim().max(120),
    street: z.string().trim().max(160),
    reference: z.string().trim().max(300),
    postalCode: z.string().trim().max(10),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
  })
  .refine((a) => {
    return (
      a.latitude !== null || a.reference !== "" || a.street !== "",
      {
        message: "Share your location or describe how to find you",
        path: ["reference"],
      }
    );
  });

export type ShippingAddressValues = z.infer<typeof shippingAddressSchema>;

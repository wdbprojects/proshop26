import z from "zod";

export const shippingAddressSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required").max(100),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s-]{7,20}$/, "Enter a valid phone number"),
    city: z.string().trim().min(2, "City is required").max(80),
    zone: z.string().trim().max(120).default(""),
    street: z.string().trim().max(160).default(""),
    reference: z.string().trim().max(300).default(""),
    postalCode: z.string().trim().max(10).default(""),
    latitude: z.number().min(-90).max(90).nullable().default(null),
    longitude: z.number().min(-180).max(180).nullable().default(null),
  })
  .refine((a) => {
    return (
      (a.latitude === null) === (a.longitude === null),
      {
        message: "Latitude and longitude must be sent together",
        path: ["latitude"],
      }
    );
  })
  .refine((a) => {
    return (
      a.latitude !== null || a.reference !== "" || a.street !== "",
      {
        message: "Share your location or describe how to find you",
        path: "reference",
      }
    );
  });

export const checkoutBodySchema = z.object({
  shippingAddress: shippingAddressSchema,
});

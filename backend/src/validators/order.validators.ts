import z from "zod";

export const orderIdParamSchema = z.object({
  id: z.uuid({ message: "Invalid order id" }),
});

export const updateFulfillmentSchema = z.object({
  status: z.enum(["processing", "shipped", "delivered", "cancelled"]),
  trackingNumber: z.string().trim().min(1).max(100).optional(),
});

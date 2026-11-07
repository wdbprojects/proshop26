import z from "zod";

export const orderIdParamSchema = z.object({
  id: z.uuid({ message: "Invalid order id" }),
});

export const updateFulfillmentSchema = z.object({
  status: z.enum([
    "unfulfilled",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  trackingNumber: z.string().trim().min(1).max(100).optional(),
});

export const manageOrdersQuerySchema = z.object({
  page: z.coerce.number().int().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  payment: z.enum(["pending", "paid", "failed"]).optional(),
  fulfillment: z
    .enum(["unfulfilled", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
  q: z.string().trim().max(100).optional(),
});

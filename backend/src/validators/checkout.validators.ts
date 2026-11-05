import z from "zod";
import { shippingAddressSchema } from "./shipping.validators";

export const checkoutBodySchema = z.object({
  shippingAddress: shippingAddressSchema,
});

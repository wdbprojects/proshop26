import z from "zod";
import {
  coordsIssue,
  coordsTogether,
  hasWayToFind,
  shippingShape,
  wayToFindIssue,
} from "./shipping.validators";

export const addressInputSchema = z
  .object({
    ...shippingShape,
    label: z.string().trim().max(40).default(""),
    isDefault: z.boolean().default(false),
  })
  .refine(coordsTogether, coordsIssue)
  .refine(hasWayToFind, wayToFindIssue);
export type AddressInput = z.infer<typeof addressInputSchema>;

export const addressIdParamsSchema = z.object({
  id: z.uuid({ message: "Invalid address id" }),
});

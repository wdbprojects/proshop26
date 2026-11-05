import { z } from "zod";
import type { IAddress } from "@/config/type-schemas";

const addressShape = {
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Full name is required" })
    .max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,20}$/, { message: "Enter a valid phone number" }),
  city: z.string().min(1, { message: "Select a department" }),
  zone: z.string().trim().max(200),
  street: z.string().trim().max(160),
  reference: z.string().trim().max(300),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
};

type Reachable = { latitude: number | null; street: string; reference: string };
const hasWayToFind = (a: Reachable) => {
  return a.latitude !== null || a.reference !== "" || a.street !== "";
};
const wayToFindIssue = {
  message: "Share your location or describe  how to find you",
  path: ["reference"],
};

// what checkout sends
export const shippingAddressSchema = z
  .object(addressShape)
  .refine(hasWayToFind, wayToFindIssue);
export type ShippingAddressValues = z.infer<typeof shippingAddressSchema>;

// what the address forms edit
export const addressFormSchema = z
  .object({
    ...addressShape,
    label: z.string().trim().max(40, { message: "Label is too long" }),
    isDefault: z.boolean(),
  })
  .refine(hasWayToFind, wayToFindIssue);
export type AddressFormValues = z.infer<typeof addressFormSchema>;

export const emptyAddress: AddressFormValues = {
  fullName: "",
  phone: "",
  city: "",
  zone: "",
  street: "",
  reference: "",
  latitude: null,
  longitude: null,
  label: "",
  isDefault: false,
};

type AddressSource = {
  fullName: string;
  phone: string;
  city: string;
  zone: string | null;
  street: string | null;
  reference: string | null;
  latitude: number | null;
  longitude: number | null;
};

// works for a saved address (null) and for form values (strings)
export const toShippingPayload = (a: AddressSource): ShippingAddressValues => {
  return {
    fullName: a.fullName,
    phone: a.phone,
    city: a.city,
    zone: a.zone ?? "",
    street: a.street ?? "",
    reference: a.reference ?? "",
    latitude: a.latitude,
    longitude: a.longitude,
  };
};
export const toFormValues = (a: IAddress): AddressFormValues => {
  return {
    ...toShippingPayload(a),
    label: a.label ?? "",
    isDefault: a.isDefault,
  };
};

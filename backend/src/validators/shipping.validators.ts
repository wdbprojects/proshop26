import z from "zod";
import { DEPARTMENTS } from "../lib/departments";

export const shippingShape = {
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,20}$/, "Enter a valid phone number"),
  city: z.enum(DEPARTMENTS, { message: "Select a department" }),
  zone: z.string().trim().max(120).default(""),
  street: z.string().trim().max(160).default(""),
  reference: z.string().trim().max(300).default(""),
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
};

type Reachable = {
  latitude: number | null;
  longitude: number | null;
  street: string;
  reference: string;
};

export const coordsTogether = (a: Reachable) => {
  return (a.latitude === null) === (a.longitude === null);
};

export const coordsIssue = {
  message: "Latitude and longitude must be sent together",
  path: ["latitude"],
};

export const hasWayToFind = (a: Reachable) => {
  return a.latitude !== null || a.reference !== "" || a.street !== "";
};

export const wayToFindIssue = {
  message: "Share your location or describe how to find you",
  path: ["reference"],
};

export const shippingAddressSchema = z
  .object(shippingShape)
  .refine(coordsTogether, coordsIssue)
  .refine(hasWayToFind, wayToFindIssue);

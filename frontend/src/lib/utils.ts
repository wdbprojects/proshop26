import { routes } from "@/config/routes";
import { STORE_CURRENCY } from "@/config/store";
import { Gauge, MapPinIcon, PackageIcon, UserIcon } from "lucide-react";

export { cn } from "cn";

export const formatOrderWhen = (
  iso: string,
  opts: Intl.DateTimeFormatOptions = {},
) => {
  const { dateStyle = "medium" } = opts;
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: dateStyle,
    timeStyle: "short",
  }).format(date);
};

// format price
export const formatPrice = (
  cents: number,
  currency: string = STORE_CURRENCY,
) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: (currency || STORE_CURRENCY).toUpperCase(),
  }).format(cents / 100);
};

// format number with decimal places
export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
};

// helper that handles accents
export const slugify = (value: string) => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^-+|-+$/g, "");
};

export const initials = (name?: string | null) => {
  const letters = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => {
      return part[0]?.toUpperCase();
    })
    .join("");
  return letters || "?";
};

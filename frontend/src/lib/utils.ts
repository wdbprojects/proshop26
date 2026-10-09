export { cn } from "cn";

export const formatPrice = (cents: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: (currency ?? "usd").toUpperCase(),
  }).format(cents);
};

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
export const formatPriceNew = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency ?? "usd").toUpperCase(),
  }).format(price / 100);
};

// format number with decimal places
export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
};

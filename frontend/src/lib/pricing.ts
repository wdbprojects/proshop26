import { ONLINE_DISCOUNT_PERCENT } from "@/config/store";

export const onlinePriceCents = (listCents: number) => {
  return Math.round((listCents * (100 - ONLINE_DISCOUNT_PERCENT)) / 100);
};

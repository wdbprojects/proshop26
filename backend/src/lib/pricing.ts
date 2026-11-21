// Keep in sync with frontend/src/config/store.ts
export const ONLINE_DISCOUNT_PERCENT = 10;

// products.priceCents is the LIST price (phone / cash on delivery). Anyone pauying online (QR or card) pays this.
export const onlinePriceCents = (listCents: number) => {
  return Math.round((listCents * (100 - ONLINE_DISCOUNT_PERCENT)) / 100);
};

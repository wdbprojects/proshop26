import type { FulfillmentStatus } from "../drizzle/schema";

/* Allowed moves only. Once shipped, an order can't be cancelled (it's physically gone), and delivered/cancelled are final.  */

const TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  unfulfilled: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const canTransition = (
  from: FulfillmentStatus,
  to: FulfillmentStatus,
) => {
  return TRANSITIONS[from].includes(to);
};

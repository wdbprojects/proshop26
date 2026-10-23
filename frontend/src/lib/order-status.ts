import type { FulfillmentStatus } from "@/config/type-schemas";

export const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  unfulfilled: "Order received",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/* Mirrors TRANSITIONS in backend/src/lib/order-status.ts. The backend is the real gate; this only decides which buttons to show. */
export const FULFILLMENT_NEXT: Record<FulfillmentStatus, FulfillmentStatus[]> =
  {
    unfulfilled: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

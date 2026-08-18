"use client";

import { OrderDetailsResponse } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useOrderDetails = (orderId: string) => {
  const { data, isLoading, error } = useQuery<OrderDetailsResponse>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      return apiFetch<OrderDetailsResponse>(`/api/orders/${orderId}`, {
        method: "GET",
      });
    },
    enabled: Boolean(orderId),
  });

  const items = data?.items ?? [];
  const paid = data?.singleOrder?.status === "paid";

  return {
    order: data,
    items: items,
    paid: paid,
    isLoading: isLoading,
    error: error,
  };
};

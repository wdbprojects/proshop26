"use client";

import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useOrderDetails = (orderId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => {
      return apiFetch(`/api/orders/${orderId}`, { method: "GET" });
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

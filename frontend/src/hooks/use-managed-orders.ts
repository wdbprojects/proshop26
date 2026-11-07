"use client";

import {
  FulfillmentStatus,
  ManagedOrdersResponse,
  OrdersSummary,
  PaymentStatus,
} from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type ManagedOrdersFiltes = {
  page: number;
  q: string;
  payment?: PaymentStatus;
  fulfillment?: FulfillmentStatus;
};

export const useManagedOrders = (filters: ManagedOrdersFiltes) => {
  return useQuery<ManagedOrdersResponse>({
    queryKey: ["orders", "manage", filters],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: "20",
      });
      if (filters.q) params.set("q", filters.q);
      if (filters.payment) params.set("payment", filters.payment);
      if (filters.fulfillment) params.set("fulfillment", filters.fulfillment);
      return apiFetch<ManagedOrdersResponse>(
        `/api/orders/manage?${params.toString()}`,
        { method: "GET" },
      );
    },
    // keep the old rows on screeen while a filter change loads
    placeholderData: keepPreviousData,
  });
};

export const useOrdersSummary = (enabled: boolean) => {
  return useQuery<OrdersSummary>({
    queryKey: ["orders", "summary"],
    queryFn: () => {
      return apiFetch<OrdersSummary>("/api/orders/manage/summary", {
        method: "GET",
      });
    },
    enabled: enabled,
    refetchInterval: 60 * 1000,
  });
};

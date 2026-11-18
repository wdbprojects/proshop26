"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { CheckoutMethods } from "@/config/type-schemas";

export const useCheckoutMethods = () => {
  return useQuery<CheckoutMethods>({
    queryKey: ["checkout", "methods"],
    queryFn: () => {
      return apiFetch<CheckoutMethods>("/api/checkout/methods", {
        method: "GET",
      });
    },
  });
};

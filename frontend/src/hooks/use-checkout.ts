"use client";

import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { ShippingAddressValues } from "@/schemas/checkout-schemas";
import { useMutation } from "@tanstack/react-query";

export const useCheckout = () => {
  return useMutation({
    mutationFn: (shippingAddress: ShippingAddressValues) => {
      return apiFetch<{ checkoutUrl: string }>("/api/checkout", {
        method: "POST",
        body: { shippingAddress },
      });
    },
    onSuccess: (data) => {
      // external Polar URL: a full navigation is the right tool
      window.location.assign(data.checkoutUrl);
    },
    onError: (err: Error) => {
      toast.add({
        type: "error",
        title: "Checkout failed",
        description: err.message || "Please try again",
      });
    },
  });
};

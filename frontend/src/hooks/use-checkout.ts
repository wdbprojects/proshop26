"use client";

import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { ShippingAddressValues } from "@/schemas/address-schemas";
import { useMutation } from "@tanstack/react-query";

type CheckoutInput = { address: ShippingAddressValues; save: boolean };

export const useCheckout = () => {
  return useMutation({
    mutationFn: async ({ address, save }: CheckoutInput) => {
      if (save) {
        try {
          await apiFetch("/api/addresses", {
            method: "POST",
            body: { ...address, label: "", isDefault: false },
          });
        } catch {}
      }
      return apiFetch<{ checkoutUrl: string }>("/api/checkout", {
        method: "POST",
        body: { shippingAddress: address },
      });
    },
    onSuccess: (data) => {
      // external Polar URL: a full navigation is the right tool
      return window.location.assign(data.checkoutUrl);
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

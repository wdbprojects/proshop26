"use client";

import { toast } from "@/components/ui/toast";
import { QrCheckoutData } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { ShippingAddressValues } from "@/schemas/address-schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADDRESSES_QUERY_KEY } from "./use-addresses";

type CheckoutInput = { address: ShippingAddressValues; save: boolean };

const saveAddressQuietly = async (address: ShippingAddressValues) => {
  try {
    await apiFetch("/api/addresses", {
      method: "POST",
      body: { ...address, label: "", isDefault: false },
    });
  } catch {
    // a convenience (limit reached, network...). The order must not depend on it.
  }
};

const onCheckoutError = (err: Error) => {
  toast.add({
    type: "error",
    title: "Checkout failed",
    description: err.message || "Please try again",
  });
};

// card, via Polar
export const useCheckout = () => {
  return useMutation({
    mutationFn: async ({ address, save }: CheckoutInput) => {
      if (save) await saveAddressQuietly(address);
      return apiFetch<{ checkoutUrl: string }>("/api/checkout", {
        method: "POST",
        body: { shippingAddress: address },
      });
    },
    onSuccess: (data) => {
      // external Polar URL: a full navigation is the right tool
      window.location.assign(data.checkoutUrl);
    },
    onError: onCheckoutError,
  });
};

// QR, via the bank
export const useQrCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ address, save }: CheckoutInput) => {
      if (save) await saveAddressQuietly(address);
      return apiFetch<QrCheckoutData>("/api/checkout/qr", {
        method: "POST",
        body: { shippingAddress: address },
      });
    },
    onSuccess: () => {
      // the address may have just been saved
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
    onError: onCheckoutError,
  });
};

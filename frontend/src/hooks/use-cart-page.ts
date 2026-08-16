"use client";

import { useTransition } from "react";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useQuery } from "@tanstack/react-query";
import { IProducts } from "@/config/types";
import { useRouter } from "next/navigation";

export const useCartPage = () => {
  const [checkoutLoading, startCheckoutTransition] = useTransition();
  const router = useRouter();

  const items = useCart((state) => {
    return state.items;
  });
  const setQuantity = useCart((state) => {
    return state.setQuantity;
  });
  const removeItem = useCart((state) => {
    return state.removeItem;
  });

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => {
      return apiFetch("/api/products", { method: "GET" });
    },
    enabled: items.length > 0,
  });

  const products: IProducts[] = productsData?.products ?? [];
  const byId = new Map(
    products.map((prod: IProducts) => {
      return [prod.id, prod];
    }),
  );
  const lines = items.map((line) => {
    return { line: line, product: byId.get(line.productId) ?? null };
  });

  const subTotal = lines.reduce((sum, { line, product }) => {
    return sum + line.quantity * (product?.priceCents ?? 0);
  }, 0);

  const checkout = () => {
    startCheckoutTransition(async () => {
      const body = {
        items: items.map((item) => {
          return { productId: item.productId, quantity: item.quantity };
        }),
      };
      const response = await apiFetch("/api/checkout", {
        method: "POST",
        body: body,
      });
      if (response?.checkoutUrl) {
        router.push(response?.checkoutUrl);
        return;
      }
    });
  };
  return {
    items: items,
    setQuantity: setQuantity,
    removeItem: removeItem,
    productsLoading: productsLoading,
    productsError: productsError,
    lines: lines,
    subTotal: subTotal,
    checkout: checkout,
    checkoutLoading: checkoutLoading,
  };
};

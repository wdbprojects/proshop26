"use client";

import { useTransition } from "react";
import { apiFetch } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ICart } from "@/types/cart";
import {
  CART_QUERY_KEY,
  CartResponse,
  useCartQuery,
} from "@/hooks/use-cart-query";

export const useCartPage = () => {
  const [checkoutLoading, startCheckoutTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: cartData,
    isLoading: cartLoading,
    isError: cartError,
  } = useCartQuery();

  const items = cartData?.cart.items ?? [];

  /* Shared optimistic-update helper: apply a local change to the cached cart immediately, roll back on failure, and adopt the server's response as the new truth on success. Both mutations below use this same pattern so a stock-limit clamp from the server always wins.  */
  const applyOptimisticUpdate = async (updater: (previous: ICart) => ICart) => {
    await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
    const previous = queryClient.getQueryData<CartResponse>(CART_QUERY_KEY);
    if (previous) {
      queryClient.setQueryData<CartResponse>(CART_QUERY_KEY, {
        cart: updater(previous.cart),
      });
    }
    return { previous: previous };
  };

  const rollback = (previous?: CartResponse) => {
    if (previous) {
      queryClient.setQueryData(CART_QUERY_KEY, previous);
    }
  };

  const setQuantityMutation = useMutation({
    mutationFn: ({
      cartItemId,
      quantity,
    }: {
      cartItemId: string;
      quantity: number;
    }) =>
      apiFetch<CartResponse>(`/api/cart/items/${cartItemId}`, {
        method: "PATCH",
        body: { quantity: quantity },
      }),
    onMutate: ({ cartItemId, quantity }) =>
      applyOptimisticUpdate((previousCart) => ({
        ...previousCart,
        items:
          quantity <= 0
            ? previousCart.items.filter((item) => item.id !== cartItemId)
            : previousCart.items.map((item) =>
                item.id === cartItemId ? { ...item, quantity: quantity } : item,
              ),
      })),
    onError: (_err, _vars, context) => rollback(context?.previous),
    onSuccess: (data) => queryClient.setQueryData(CART_QUERY_KEY, data),
  });

  const removeItemMutation = useMutation({
    mutationFn: (cartItemId: string) =>
      apiFetch<CartResponse>(`/api/cart/items/${cartItemId}`, {
        method: "DELETE",
      }),
    onMutate: (cartItemId) =>
      applyOptimisticUpdate((previousCart) => ({
        ...previousCart,
        items: previousCart.items.filter((item) => item.id !== cartItemId),
      })),
    onError: (_err, _vars, context) => rollback(context?.previous),
    onSuccess: (data) => queryClient.setQueryData(CART_QUERY_KEY, data),
  });

  /* Kept the same (productId, quantity) signature the component already calls with, since cart-items.tsx passes line.productId today  */
  const setQuantity = (cartItemId: string, quantity: number) => {
    setQuantityMutation.mutate({ cartItemId, quantity: Math.max(0, quantity) });
  };

  const removeItem = (cartItemId: string) => {
    removeItemMutation.mutate(cartItemId);
  };

  /* Comes straight from the server's denormalized total - no more client-side reduce() over a locally-joined product list */
  const subTotal = cartData?.cart.itemsPriceCents ?? 0;

  const checkout = () => {
    startCheckoutTransition(async () => {
      const body = {
        items: items.map((item) => {
          return { productId: item.productId, quantity: item.quantity };
        }),
      };
      const response = (await apiFetch("/api/checkout", {
        method: "POST",
        body: body,
      })) as { checkoutUrl?: string } | undefined;
      if (response?.checkoutUrl) {
        router.push(response.checkoutUrl);
        return;
      }
    });
  };

  return {
    items: items,
    setQuantity: setQuantity,
    removeItem: removeItem,
    cartLoading: cartLoading,
    cartError: cartError,
    subTotal: subTotal,
    checkout: checkout,
    checkoutLoading: checkoutLoading,
  };
};

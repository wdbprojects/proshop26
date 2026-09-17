"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CART_QUERY_KEY, CartResponse } from "@/hooks/use-cart-query";
import { apiFetch } from "@/lib/api";

import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

/* Used by every add-to-cart button (catalog cards, product details, and anywhere else you add one later) so the mutation logic, cache sync, and toast feedback all stay in one place instead of being re-emplemented slightly differently per component */

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) =>
      apiFetch<CartResponse>("/api/cart/items", {
        method: "POST",
        body: { productId: productId, quantity: quantity },
      }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
      const qty = variables.quantity ?? 1;
      const label = qty === 1 ? "item" : "items";
      const addedItem = data.cart.items.find((item) => {
        return item.productId === variables.productId;
      });
      toast.add({
        type: "success",
        title: "Success!",
        description: `Added ${qty} ${label} of "${addedItem?.name}" to cart`,
        actionProps: {
          children: "Go to cart",
          onClick() {
            router.push(routes.cart);
          },
        },
      });
    },
    onError: (err: Error) => {
      /* Surfaces the real backend message where there is one */
      toast.add({
        type: "error",
        title: "Error!",
        description: err.message || "Couldn't add item to cart",
      });
    },
  });
};

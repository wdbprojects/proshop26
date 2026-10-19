"use client";

import { toast } from "@/components/ui/toast";
import {
  OrderDetailsResponse,
  RateProductResponse,
} from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRateProduct = (orderId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      rating,
    }: {
      productId: string;
      rating: number;
    }) =>
      apiFetch<RateProductResponse>(`/api/reviews/${productId}`, {
        method: "PUT",
        body: { rating },
      }),
    onSuccess: (_data, { productId, rating }) => {
      /* patch the order in the cache so the stars don't flicker back while a refetch */
      queryClient.setQueryData<OrderDetailsResponse>(
        ["order", orderId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) => {
              return item.product.id === productId
                ? { ...item, myRating: rating }
                : item;
            }),
          };
        },
      );
      /* averages changed: refresh catalog lists and product pages */
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.add({ type: "success", title: "Thanks for the rating!" });
    },
    onError: (err: Error) => {
      toast.add({
        type: "error",
        title: "Error!",
        description: err.message || "Couldn't save your rating",
      });
    },
  });
};

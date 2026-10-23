"use client";

import { toast } from "@/components/ui/toast";
import { FulfillmentStatus } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type NextStatus = Exclude<FulfillmentStatus, "unfulfilled">;

export const useUpdateFulfillment = (orderId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      status,
      trackingNumber,
    }: {
      status: NextStatus;
      trackingNumber?: string;
    }) => {
      return apiFetch(`/api/orders/${orderId}/fulfillment`, {
        method: "PATCH",
        body: { status, trackingNumber },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.add({
        type: "success",
        title: "Order uptdated",
      });
    },
    onError: (err: Error) => {
      toast.add({
        type: "error",
        title: "Error!",
        description: err.message || "Couldn't update the order",
      });
    },
  });
};

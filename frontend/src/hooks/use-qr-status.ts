"use client";

import { useQuery } from "@tanstack/react-query";
import { QrStatusResponse } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";

export const useQrStatus = (qrId: string) => {
  return useQuery<QrStatusResponse>({
    queryKey: ["checkout", "qr", qrId],
    queryFn: () => {
      return apiFetch<QrStatusResponse>(`/api/checkout/qr/${qrId}`, {
        method: "GET",
      });
    },
    retry: false,
    refetchInterval: (query) => {
      if (query.state.status === "error") return false;
      const status = query.state.data?.status;
      return status === undefined || status === "pending" ? 4000 : false;
    },
  });
};

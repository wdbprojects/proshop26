"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { routes } from "@/config/routes";

export const useSignOut = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch("/api/auth/sign-out", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
      toast.add({ type: "success", title: "Signed out successfully" });
      router.push(routes.login);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.add({
        type: "error",
        title: "Error",
        description: error.message || "Sign out failed, please try again",
      });
    },
  });
};

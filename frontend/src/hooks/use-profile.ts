"use client";

import { toast } from "@/components/ui/toast";
import { ProfileResponse } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProfile = () => {
  return useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: () => apiFetch<ProfileResponse>("/api/profile", { method: "GET" }),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: { name: string }) => {
      return apiFetch("/api/profile", { method: "PATCH", body: values });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // the sidebar and headers read the name from the session cache
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.add({ type: "success", title: "Profile updated" });
    },
    onError: (err: Error) => {
      toast.add({
        type: "error",
        title: "Error",
        description: err.message || "Coudn't update your profile",
      });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (values: { currentPassword: string; newPassword: string }) => {
      return apiFetch("/api/profile/change-password", {
        method: "POST",
        body: values,
      });
    },
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Password updated",
        description: "Password updated! Your other devides were signed out.",
      });
    },
    onError: (err: Error) => {
      toast.add({
        type: "error",
        title: "Error",
        description: err.message || "Couldn't change the password",
      });
    },
  });
};

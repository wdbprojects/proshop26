"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AdminUsersResponse, UserRole } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { toast } from "@/components/ui/toast";

export type AdminUsersFilters = {
  page: number;
  q: string;
  role?: UserRole;
  status?: "active" | "banned";
};

export const useAdminUsers = (filters: AdminUsersFilters) => {
  return useQuery<AdminUsersResponse>({
    queryKey: ["admin", "users", filters],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: "20",
      });
      if (filters.q) params.set("q", filters.q);
      if (filters.role) params.set("role", filters.role);
      if (filters.status) params.set("status", filters.status);
      return apiFetch<AdminUsersResponse>(
        `/api/admin/users?${params.toString()}`,
        { method: "GET" },
      );
    },
    placeholderData: keepPreviousData,
  });
};

export const useUserActions = () => {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };
  const onError = (err: Error) => {
    toast.add({
      type: "error",
      title: "Error",
      description: err.message || "Something went wrong",
    });
  };

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => {
      return apiFetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        body: { role },
      });
    },
    onSuccess: () => {
      refresh();
      toast.add({ type: "success", title: "Role updated" });
    },
    onError,
  });

  const ban = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => {
      return apiFetch(`/api/admin/users/${id}/ban`, {
        method: "POST",
        body: { reason },
      });
    },
    onSuccess: () => {
      refresh();
      toast.add({ type: "success", title: "User banned" });
    },
    onError,
  });
  const unban = useMutation({
    mutationFn: (id: string) => {
      return apiFetch(`/api/admin/users/${id}/unban`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      refresh();
      toast.add({ type: "success", title: "User unbanned" });
    },
    onError,
  });
  return { setRole, ban, unban };
};

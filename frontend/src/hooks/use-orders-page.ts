"use client";

import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export const useOrdersPage = () => {
  // const { data: sessionData } = authClient.useSession();

  const {
    data: sessionData,
    isPending: sessionLoading,
    error: sessionError,
  } = authClient.useSession();

  // check if user is authenticated
  const isAuthenticated = !!sessionData?.user;
  const staff =
    sessionData?.user?.role === "support" ||
    sessionData?.user?.role === "admin";

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: () => {
      return apiFetch("/api/orders", { method: "GET" });
    },
    enabled: isAuthenticated && !sessionLoading,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 3;
    },
  });

  if (sessionLoading) {
    return { isLoading: false, error: null, orders: [], staff: false };
  }

  if (!isAuthenticated) {
    return { isLoading: false, error: new Error(), orders: [], staff: false };
  }

  if (error) {
    console.error("Orders fetch error:", error);
    return {
      isLoading: false,
      error: new Error("Failed to load orders"),
      orders: [],
      staff: false,
    };
  }

  const orders = data?.orders ?? [];

  return {
    isLoading: isLoading || sessionLoading,
    error: error || sessionError,
    orders: orders,
    staff: staff,
  };
};

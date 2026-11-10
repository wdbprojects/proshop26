"use client";

import { toast } from "@/components/ui/toast";
import { AdminCategoriesResponse } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { string } from "better-auth";

export const ADMIN_CATEGORIES_KEY = ["admin", "categories"];

export type CategoryPayload = {
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  active: boolean;
};

export const useAdminCategories = () => {
  return useQuery<AdminCategoriesResponse>({
    queryKey: ADMIN_CATEGORIES_KEY,
    queryFn: () => {
      return apiFetch<AdminCategoriesResponse>("/api/admin/categories", {
        method: "GET",
      });
    },
  });
};

export const useCategoryActions = () => {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_KEY });
    // the storefront, the filters and the product form read these
    queryClient.invalidateQueries({ queryKey: ["product-categories"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  };
  const onError = (err: Error) => {
    toast.add({
      type: "error",
      title: "Error",
      description: err.message || "Something went wrong",
    });
  };

  const create = useMutation({
    mutationFn: (values: CategoryPayload) => {
      return apiFetch("/api/admin/categories", {
        method: "POST",
        body: values,
      });
    },
    onSuccess: () => {
      refresh();
      toast.add({ type: "success", title: "Category created" });
    },
    onError,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Partial<CategoryPayload>;
    }) => {
      return apiFetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        body: values,
      });
    },
    onSuccess: () => {
      refresh();
      toast.add({ type: "success", title: "Category updated" });
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => {
      return apiFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      refresh();
      toast.add({ type: "success", title: "Category deleted" });
    },
    onError,
  });

  return { create, update, remove };
};

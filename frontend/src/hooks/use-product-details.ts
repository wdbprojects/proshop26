"use client";

import { ProductType } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useProductDetails = (slug: string) => {
  const {
    data: productDetails,
    isLoading: loadingProductDetails,
    error: productDetailsError,
  } = useQuery<{ product: ProductType }>({
    queryKey: ["product", slug],
    queryFn: () => apiFetch(`/api/products/${slug}`, { method: "GET" }),
    enabled: Boolean(slug),
  });

  return {
    product: productDetails?.product ?? null,
    loadingProductDetails: loadingProductDetails,
    productDetailsError: productDetailsError,
  };
};

export const useProductDetailsId = (id: string) => {
  const { data, isLoading, error } = useQuery<{ product: ProductType }>({
    queryKey: ["admin", "product", id],
    queryFn: () => apiFetch(`/api/admin/products/${id}`, { method: "GET" }),
    enabled: Boolean(id),
  });
  return { product: data?.product ?? null, isLoading: isLoading, error: error };
};

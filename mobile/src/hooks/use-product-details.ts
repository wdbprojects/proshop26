import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ProductResponse } from "@/types/api";

export const useProductDetails = (slug: string) => {
  const query = useQuery({
    queryKey: ["product", slug],
    queryFn: () =>
      apiFetch<ProductResponse>(`/api/products/${slug}`, { method: "GET" }),
    enabled: Boolean(slug),
  });

  return {
    product: query.data?.product ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};

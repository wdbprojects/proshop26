"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";

export type ProductSuggestion = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  thumbnail: string | null;
  priceCents: number;
  currency: string;
};

export const useProductSuggestions = (query: string) => {
  const debouncedQuery = useDebounce(query.trim(), 300);
  const enabled = debouncedQuery.length >= 2;

  const { data, isFetching } = useQuery({
    queryKey: ["product-suggestions", debouncedQuery],
    queryFn: () => {
      return apiFetch<{ suggestions: ProductSuggestion[] }>(
        `/api/products/suggest?q=${encodeURIComponent(debouncedQuery)}`,
        { method: "GET" },
      );
    },
    enabled: enabled,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
  return {
    suggestions: enabled ? (data?.suggestions ?? []) : [],
    isFetching: isFetching,
    enabled: enabled,
  };
};

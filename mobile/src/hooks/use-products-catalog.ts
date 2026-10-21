import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/query-string";
import { CategoriesResponse, ProductSort, ProductsResponse } from "@/types/api";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

const PAGE_SIZE = 12;

type CatalogFilters = {
  q: string;
  category: string;
  sort: ProductSort;
};

export const useProductsCatalog = ({ q, category, sort }: CatalogFilters) => {
  const categoriesQuery = useQuery({
    queryKey: ["product-categories", { q, category, sort }],
    queryFn: () =>
      apiFetch<CategoriesResponse>("/api/products/categories", {
        method: "GET",
      }),
  });
  const productsQuery = useInfiniteQuery({
    /* "infinite" keeps this cache separate from the home screen's lists, but everything still starts with "products" so one invalidate refreshes all of them */
    queryKey: ["products", "infinite", { q, category, sort }],
    queryFn: async ({ pageParam }) => {
      const path = `/api/products${buildQuery({
        q: q,
        category: category,
        sort: sort,
        page: pageParam,
        limit: PAGE_SIZE,
      })}`;
      const data = await apiFetch<ProductsResponse>(path, {
        method: "GET",
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (!pagination) return undefined;
      return pagination.page < pagination.totalPages
        ? pagination.page + 1
        : undefined;
    },
    /* keep the old results on screen (dimmed) while a new search loads */
    placeholderData: keepPreviousData,
  });
  const products =
    productsQuery.data?.pages.flatMap((page) => {
      return page.products;
    }) ?? [];
  const total = productsQuery.data?.pages[0].pagination.total ?? 0;

  return {
    categories: categoriesQuery.data?.categories ?? [],
    products: products,
    total: total,
    isLoading: productsQuery.isLoading,
    isPlaceholderData: productsQuery.isPlaceholderData,
    error: productsQuery.error,
    hasNextPage: productsQuery.hasNextPage,
    isFetchingNextPage: productsQuery.isFetchingNextPage,
    fetchNextPage: productsQuery.fetchNextPage,
  };
};

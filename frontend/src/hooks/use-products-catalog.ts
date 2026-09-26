"use client";

import { CategoriesResponse, ProductType } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ProductsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ProductsResponse = {
  products: ProductType[];
  pagination?: ProductsPagination;
};

/* Same shape as use-home-catalog.ts (category filter synced to the URL, same "products" query key pattern) but also drives pagination via ?page= param. Kept as its own hook rather than merged into use-home-catalog.ts for now, since the home page's catalog section may be redesigned or removed later - once that's settled, these two likely collapse into one shared hook. */

export const useProductsCatalog = ({ limit = 12 }: { limit?: number } = {}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /* Holds a category *slug* now (was a raw category string pre-migration) - matches what CategoriesList passes to setCategory and what the backend now resolves ?category= against  */
  const categoryFilter = (searchParams.get("category") ?? "").trim();
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const setCategory = (category: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!category) {
      next.delete("category");
    } else {
      next.set("category", category);
    }
    // changing category invalidates whatever page you were on
    next.delete("page");
    router.replace(`${pathname}?${next.toString().toLowerCase()}`);
  };

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(nextPage));
    router.replace(`${pathname}?${next.toString()}`);
  };

  /* GET CATEGORIES */
  const { data: categoriesData, isLoading: loadingCategories } =
    useQuery<CategoriesResponse>({
      queryKey: ["product-categories"],
      queryFn: () => apiFetch("/api/products/categories", { method: "GET" }),
    });

  /* GET PRODUCTS (paginated) */
  const {
    data: productsData,
    isLoading: loadingProducts,
    error,
  } = useQuery({
    queryKey: ["products", categoryFilter, page, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryFilter) {
        params.set("category", categoryFilter);
      }
      params.set("page", String(page));
      params.set("limit", String(limit));
      return apiFetch<ProductsResponse>(`/api/products?${params.toString()}`, {
        method: "GET",
      });
    },
  });
  const categories = categoriesData?.categories ?? [];
  const products = productsData?.products ?? [];
  const categoryChipsLoading = loadingCategories && categories.length === 0;
  const totalPages = productsData?.pagination?.totalPages ?? 1;

  return {
    categoryFilter: categoryFilter,
    setCategory: setCategory,
    categories: categories,
    products: products,
    categoryChipsLoading: categoryChipsLoading,
    loadingCategories: loadingCategories,
    loadingProducts: loadingProducts,
    error: error,
    page: page,
    setPage: setPage,
    totalPages: totalPages,
  };
};

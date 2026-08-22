"use client";

import {
  CategoriesResponse,
  ProductCreateSchemaType,
} from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useHomeCatalog = () => {
  const searchParams = useSearchParams();
  const searchData = searchParams.get("category");
  const categoryFilter = searchData?.trim() ?? "";

  const router = useRouter();
  const pathname = usePathname();

  const setCategory = (category: string) => {
    const next = new URLSearchParams(searchParams?.toString());
    if (!category) {
      next.delete("category");
    } else {
      next.set("category", category);
    }
    router.replace(`${pathname}?${next.toString().toLowerCase()}`);
  };

  /* GET CATEGORIES */
  const { data: categoriesData, isLoading: loadingCategories } =
    useQuery<CategoriesResponse>({
      queryKey: ["product-categories"],
      queryFn: () => apiFetch("/api/products/categories", { method: "GET" }),
    });

  /* GET PRODUCTS */
  const {
    data: productsData,
    isLoading: loadingProducts,
    error: error,
  } = useQuery({
    queryKey: ["products", categoryFilter],
    queryFn: () => {
      return apiFetch<{ products: ProductCreateSchemaType[] }>(
        categoryFilter
          ? `/api/products?category=${encodeURIComponent(categoryFilter)}`
          : "/api/products",
        { method: "GET" },
      );
    },
  });
  const categories = categoriesData?.categories ?? [];
  const products = productsData?.products ?? [];
  const categoryChipsLoading = loadingCategories && categories.length === 0;

  return {
    categoryFilter: categoryFilter,
    setCategory: setCategory,
    categories: categories,
    products: products,
    categoryChipsLoading: categoryChipsLoading,
    loadingCategories: loadingCategories,
    loadingProducts: loadingProducts,
    error: error,
  };
};

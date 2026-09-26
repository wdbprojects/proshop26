"use client";

import { CategoriesResponse, ProductType } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";

/* Home page only needs: the category list (for HomeHero's quick links) amd a small "featured" set of products. Category filtering used to live here too, synced to the URL - removed since the home page no longer hosts a filterable catalog (that's what /products and use-products-catalog.ts are for now).
"Featured" is backed by products.isFeatured on the backend, with an automatic fallback to newest-active products until something is actually flagged featured (e.g. before admin tooling to set that flag exists)
*/

export const useHomeCatalog = () => {
  /* GET CATEGORIES (for HomeHero) */
  const { data: categoriesData, isLoading: loadingCategories } =
    useQuery<CategoriesResponse>({
      queryKey: ["product-categories"],
      queryFn: () => apiFetch("/api/products/categories", { method: "GET" }),
    });

  /* GET FEATURED PRODUCTS (small teaser set) */
  const {
    data: productsData,
    isLoading: loadingProducts,
    error: error,
  } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => {
      return apiFetch<{ products: ProductType[] }>(
        "/api/products?featured=true&limit=8",
        { method: "GET" },
      );
    },
  });

  return {
    categories: categoriesData?.categories ?? [],
    products: productsData?.products ?? [],
    loadingCategories: loadingCategories,
    loadingProducts: loadingProducts,
    error: error,
  };
};

import { apiFetch } from "@/lib/api";
import { CategoriesResponse, ProductsResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export const useHomeCatalog = () => {
  const categoriesQuery = useQuery({
    queryKey: ["product-categories"],
    queryFn: () =>
      apiFetch<CategoriesResponse>("/api/products/categories", {
        method: "GET",
      }),
  });
  const productsQuery = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () =>
      apiFetch<ProductsResponse>("/api/products?featured=true&limit=8", {
        method: "GET",
      }),
  });
  return {
    categories: categoriesQuery.data?.categories ?? [],
    products: productsQuery.data?.products ?? [],
    loadingCategories: categoriesQuery.isLoading,
    loadingProducts: productsQuery.isLoading,
    error: productsQuery.error,
  };
};

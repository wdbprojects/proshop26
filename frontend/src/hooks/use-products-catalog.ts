"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategoriesResponse, ProductType } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";

type ProductsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProductsFacets = {
  brands: { brand: string | null; count: number }[];
  price: { min: number; max: number }; // cents
};

type ProductsResponse = {
  products: ProductType[];
  pagination?: ProductsPagination;
  facets?: ProductsFacets;
};

export const SORT_OPTIONS = [
  { value: "relevance", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const dollarsToCents = (value: string) => {
  if (value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? Math.round(num * 100) : null;
};

export const useProductsCatalog = ({ limit = 12 }: { limit?: number } = {}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /* READ FITERS FROM THE URL  */
  const categoryFilter = (searchParams.get("category") ?? "").trim();
  const q = (searchParams.get("q") ?? "").trim();
  const brandParam = searchParams.get("brand") ?? "";
  const selectedBrands = brandParam
    ? brandParam.split(",").filter(Boolean)
    : [];
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawSort = searchParams.get("sort") ?? "";
  const isValidSort = SORT_OPTIONS.some((option) => {
    return option.value === rawSort;
  });
  /* "relevance" only makes sense with a search term */
  const defaultSort: SortValue = q ? "relevance" : "newest";
  const sort: SortValue =
    isValidSort && (rawSort !== "relevance" || q)
      ? (rawSort as SortValue)
      : defaultSort;

  /* ONE HELPER TO UPDATE THE URL. Any filter change resets to page 1 unless told otherwise  */
  const updateParams = (
    changes: Record<string, string | null>,
    keepPage = false,
  ) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    if (!keepPage) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  };

  const setCategory = (category: string) => {
    updateParams({ category: category || null });
  };

  const setPage = (nextPage: number) => {
    updateParams({ page: String(nextPage) }, true);
  };

  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => {
          return b !== brand;
        })
      : [...selectedBrands, brand];
    updateParams({ brand: next.join(",") || null });
  };

  const setPriceRange = (min: string, max: string) => {
    return updateParams({ minPrice: min || null, maxPrice: max || null });
  };

  const clearFilters = () => {
    return updateParams({ brand: null, minPrice: null, maxPrice: null });
  };

  const clearSearch = () => {
    return updateParams({ q: null });
  };

  /* the default sort is not stored in the URL, to keep links clean */
  const setSort = (value: string) => {
    updateParams({ sort: value === defaultSort ? null : value });
  };

  const hasActiveFilters =
    selectedBrands.length > 0 || Boolean(minPrice) || Boolean(maxPrice);

  /* GET CATEGORIES */
  const { data: categoriesData, isLoading: loadingCategories } =
    useQuery<CategoriesResponse>({
      queryKey: ["product-categories"],
      queryFn: () => apiFetch("/api/products/categories", { method: "GET" }),
    });

  /* GET PRODUCTS (search + filters + pagination) */
  const {
    data: productsData,
    isLoading: loadingProducts,
    error,
  } = useQuery({
    queryKey: [
      "products",
      {
        categoryFilter,
        q,
        brands: brandParam,
        minPrice,
        maxPrice,
        sort,
        page,
        limit,
      },
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryFilter) {
        params.set("category", categoryFilter);
      }
      if (q) params.set("q", q);
      if (selectedBrands.length > 0) {
        params.set("brand", selectedBrands.join(","));
      }
      const minCents = dollarsToCents(minPrice);
      const maxCents = dollarsToCents(maxPrice);
      if (minCents !== null) {
        params.set("minPrice", String(minCents));
      }
      if (maxCents !== null) {
        params.set("maxPrice", String(maxCents));
      }
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", String(limit));
      return apiFetch<ProductsResponse>(`/api/products?${params.toString()}`, {
        method: "GET",
      });
    },
    /* keep the old results + facets on screen while new ones load, so the filter panel doesn't blank out on every click */
    placeholderData: keepPreviousData,
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
    page: page,
    setPage: setPage,
    totalPages: productsData?.pagination?.totalPages ?? 1,
    total: productsData?.pagination?.total ?? 0,
    // search + filters
    q: q,
    clearSearch: clearSearch,
    facets: productsData?.facets,
    selectedBrands: selectedBrands,
    toggleBrand: toggleBrand,
    minPrice: minPrice,
    maxPrice: maxPrice,
    setPriceRange: setPriceRange,
    clearFilters: clearFilters,
    hasActiveFilters: hasActiveFilters,
    // sorting
    sort: sort,
    setSort: setSort,
  };
};

"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api";
import {
  CategoriesResponse,
  ProductFormData,
  ProductType,
} from "@/config/type-schemas";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ProductsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
type AdminProductsResponse = {
  products: ProductType[];
  pagination?: ProductsPagination;
};

/* Same URL-synced page pattern as use-products-catalog.ts: ?page = drives the query, router.replace keeps it bookmarkable/shareable, and the query key includes page+limit so each page is cached independently (invalidating ["admin", "products"] still matches every page, since TanStack Query invalidates by key prefix) */

export const useAdminProduct = ({ limit = 10 }: { limit?: number } = {}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductFormData | null>(null); // check which product we are editing

  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawPage = Number(searchParams.get("page"));
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(nextPage));
    router.replace(`${pathname}?${next.toString()}`);
  };

  /* GET SESSION */
  const { session } = useSession();
  const isAdmin = session?.user.role === "admin";

  /* GET PRODUCTS QUERY (paginated) */
  const { data: productsData, isLoading: dataProductsLoading } =
    useQuery<AdminProductsResponse>({
      queryKey: ["admin", "products", page, limit],
      queryFn: () => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        return apiFetch<AdminProductsResponse>(
          `/api/admin/products?${params.toString()}`,
          { method: "GET" },
        );
      },
      enabled: isAdmin,
    });
  const totalPages = productsData?.pagination?.totalPages ?? 1;

  const invalidatesProductQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    /* Matches every ["admin", "product", "id"] variant via prefix - this is the edit page's single-product query (use-product-details.ts), previously never invalidated after a save, so returning to an edit page without a full showed stale pre-save data. */
    queryClient.invalidateQueries({ queryKey: ["admin", "product"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product-categories"] });
  };

  /* CREATE PRODUCT MUTATION
  No onError here on purpose - the backend returns specific, useful messages (slug conflict, invalid category, etc.), and the only place that currently surfaces err.message is the calling component. Adding a generic toast here would just show a second, less useful message alongside it. */
  const createMutation = useMutation({
    mutationFn: async ({ body }: { body: ProductFormData }) => {
      return apiFetch("/api/admin/products", {
        method: "POST",
        body: body,
      });
    },
    onSuccess: () => {
      invalidatesProductQueries();
      setModalOpen(false);
      setEditing(null);
    },
  });

  /* UPDATE PRODUCT MUTATION */
  const updateMutation = useMutation({
    mutationFn: async ({ body, id }: { body: ProductFormData; id: string }) => {
      return await apiFetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        body: body as ProductFormData,
      });
    },
    onSuccess: () => {
      invalidatesProductQueries();
      setModalOpen(false);
      setEditing(null);
    },
  });

  /* DELETE MUTATION */
  const deleteMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      try {
        const response = await apiFetch(`/api/admin/products/${productId}`, {
          method: "DELETE",
        });
        return response;
      } catch (error) {
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
          return { success: true };
        }
        throw error;
      }
    },
    onSuccess: () => {
      invalidatesProductQueries();
      /* If this was the last item on a page beyond page 1, bounce back one page rather than leaving the admin staring at an empty table. */
      if (page > 1) {
        const remainingOnPage = (productsData?.products.length ?? 1) - 1;
        if (remainingOnPage <= 0) {
          setPage(page - 1);
        }
      }
    },
  });

  /* DELETE AN UPLOADED-BUT-NOT-YET-SAVED IMAGE FROM IMAGEKIT
    Not tied to a product - this is for cleaning up an image the admin dropped and uploaded, then removed before ever saving the product. Route is /api/admin/images/:fileId. No product-query invalidation either - nothing about any saved product changed.
  */
  const deleteUploadMutation = useMutation({
    mutationFn: async ({ imageKitFileId }: { imageKitFileId: string }) => {
      try {
        const response = await apiFetch(`/api/admin/images/${imageKitFileId}`, {
          method: "DELETE",
        });
        return response;
      } catch (err) {
        if (err instanceof SyntaxError && err.message.includes("JSON"))
          throw err;
      }
    },
  });

  /* GET CATEGORIES */
  const { data: categoriesData, isLoading: loadingCategories } =
    useQuery<CategoriesResponse>({
      queryKey: ["product-categories"],
      queryFn: () => apiFetch("/api/products/categories", { method: "GET" }),
    });
  const categories = categoriesData?.categories ?? [];

  return {
    modalOpen: modalOpen,
    setModalOpen: setModalOpen,
    editing: editing,
    setEditing: setEditing,
    products: productsData?.products ?? [],
    dataProductsLoading: dataProductsLoading,
    page: page,
    setPage: setPage,
    totalPages: totalPages,
    createMutation: createMutation,
    updateMutation: updateMutation,
    deleteMutation: deleteMutation,
    categories: categories,
    loadingCategories: loadingCategories,
    deleteUploadMutation: deleteUploadMutation,
  };
};

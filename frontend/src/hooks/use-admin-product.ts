"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  CategoriesResponse,
  ProductFormData,
  ProductWithId,
} from "@/config/type-schemas";

export const useAdminProduct = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductFormData | null>(null); // check which product we are editing

  const queryClient = useQueryClient();

  /* GET SESSION */
  const { session } = useSession();
  const isAdmin = session?.user.role === "admin";

  /* GET PRODUCTS QUERY */
  const { data: productsData, isLoading: dataProductsLoading } = useQuery<{
    products: ProductWithId[];
  }>({
    queryKey: ["admin", "products"],
    queryFn: async () =>
      (await apiFetch("/api/admin/products", { method: "GET" })) as {
        products: ProductWithId[];
      },
    enabled: isAdmin,
  });

  /* CREATE PRODUCT MUTATION */
  const createMutation = useMutation({
    mutationFn: async ({ body }: { body: ProductFormData }) => {
      return apiFetch("/api/admin/products", {
        method: "POST",
        body: body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      setModalOpen(false);
      setEditing(null);
      // toast.success("Product created successfully.... onSuccess!!");
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
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      setModalOpen(false);
      setEditing(null);
      // toast.success("Product updated successfully.... onSuccess!!");
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
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      // toast.success("Delete successfully.... onSuccess!!");
    },
    onError: (err) => {
      // toast.error(err instanceof Error ? err.message : "Delete failed");
      console.log(err);
      toast.error("Delete failed.... onError!!");
    },
  });

  /* DELETE IMAGE FROM IMAGEKIT AND DB */
  const deleteImageMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      try {
        const response = await apiFetch(
          `/api/admin/products/${productId}/image`,
          {
            method: "DELETE",
          },
        );
        return response;
      } catch (error) {
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
          return { success: true };
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast.success("Image Deleted successfully.... onSuccess!!");
    },
    onError: (err) => {
      // toast.error(err instanceof Error ? err.message : "Delete failed");
      console.log(err);
      toast.error("Delete failed.... onError!!");
    },
  });

  /* DELETE IMAGE FROM IMAGEKIT (ONLY) */
  const deleteUploadMutation = useMutation({
    mutationFn: async ({ imageKitFileId }: { imageKitFileId: string }) => {
      try {
        const response = await apiFetch(
          `/api/admin/products/${imageKitFileId}/imageUpload`,
          {
            method: "DELETE",
          },
        );
        return response;
      } catch (error) {
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
          return { success: true };
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast.success("Image Deleted successfully from ImageKit.... onSuccess!!");
    },
    onError: (err) => {
      // toast.error(err instanceof Error ? err.message : "Delete failed");
      console.log(err);
      toast.error("Delete failed.... onError!!");
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
    createMutation: createMutation,
    updateMutation: updateMutation,
    deleteMutation: deleteMutation,
    deleteImageMutation: deleteImageMutation,
    categories: categories,
    deleteUploadMutation: deleteUploadMutation,
  };
};

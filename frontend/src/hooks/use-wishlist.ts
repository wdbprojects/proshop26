"use client";

import { toast } from "@/components/ui/toast";
import { WishlistIdsResponse, WishlistResponse } from "@/config/type-schemas";
import { useUser } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const WISHLIST_IDS_KEY = ["wishlist", "ids"];
export const WISHLIST_LIST_KEY = ["wishlist", "list"];

// One shared query: every heart on the page reads from it
export const useWishlistIds = () => {
  const { isAuthenticated } = useUser();
  const query = useQuery<WishlistIdsResponse>({
    queryKey: WISHLIST_IDS_KEY,
    queryFn: () => {
      return apiFetch<WishlistIdsResponse>("/api/wishlist/ids", {
        method: "GET",
      });
    },
    enabled: isAuthenticated,
  });
  const ids = query.data?.ids ?? [];
  return { has: (productId: string) => ids.includes(productId) };
};

export const useWishlistProducts = () => {
  return useQuery<WishlistResponse>({
    queryKey: WISHLIST_LIST_KEY,
    queryFn: () => {
      return apiFetch<WishlistResponse>("/api/wishlist", { method: "GET" });
    },
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, save }: { productId: string; save: boolean }) => {
      return apiFetch(`/api/wishlist/${productId}`, {
        method: save ? "PUT" : "DELETE",
      });
    },
    onMutate: async ({ productId, save }) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_IDS_KEY });
      const previous =
        queryClient.getQueryData<WishlistIdsResponse>(WISHLIST_IDS_KEY);
      const others = (previous?.ids ?? []).filter((id) => {
        return id !== productId;
      });
      queryClient.setQueryData<WishlistIdsResponse>(WISHLIST_IDS_KEY, {
        ids: save ? [...others, productId] : others,
      });
      return { previous };
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WISHLIST_IDS_KEY, context.previous);
      }
      toast.add({
        type: "error",
        title: "Error",
        description: err.message || "Couldn't update your wishlist",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ICart } from "@/types/cart";

export const CART_QUERY_KEY = ["cart"];
export type CartResponse = { cart: ICart };

export const fetchCart = () => {
  return apiFetch<CartResponse>("/api/cart", { method: "GET" });
};

/* Any component that just needs to READ the cart (header badge, mini-cart, dropdown, the full cart page) uses this. React Query dedupes identical queries automatically, so calling this from five different components still only fires one network request and they all share one cache entry = there's no separate local copy to fall out of sync. */
export const useCartQuery = () => {
  return useQuery<CartResponse>({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
  });
};

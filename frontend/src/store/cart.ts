import { CartItem } from "@/config/types";
import { CartState } from "@/types/cart";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useCart = create<CartState>()(
  devtools(
    persist(
      (set, get) => {
        return {
          items: [],
          /* ADD ITEMS - optimistic local update. The caller (e.g.) is responsible for firing the actual POST /api/cart/items request and calling replaceItems() with the server's response once it resolves. */
          addItem: (productId: string, qty: number = 1) => {
            const items = [...get().items];
            const index = items.findIndex((item) => {
              return item.productId === productId;
            });
            if (index >= 0) {
              items[index] = {
                ...items[index],
                quantity: items[index].quantity + qty,
              };
            } else {
              items.push({ productId, quantity: qty });
            }
            set({ items: items });
          },

          /* REMOVE ITEMS */
          removeItem: (productId: string) => {
            set({
              items: get().items.filter((item: CartItem) => {
                return item.productId !== productId;
              }),
            });
          },

          /* SET QUANTITY */
          setQuantity: (productId: string, quantity: number) => {
            if (quantity <= 0) {
              set({
                items: get().items.filter((item) => {
                  return item.productId !== productId;
                }),
              });
              return;
            }
            const items = get().items.map((item) => {
              return item.productId === productId
                ? { ...item, quantity }
                : item;
            });
            set({ items: items });
          },

          /* CLEAR ITEMS */
          clearCart: () => {
            return set({ items: [] });
          },

          /* REPLACE ITEMS - reconcile local state with the server's response after any mutation, so an optimistic update that got clamped (e.g. stock limit) doesn't silently drift from what's actually in the DB. */
          replaceItems: (items: CartItem[]) => {
            return set({ items: items });
          },
        };
      },
      { name: "latienda-cart" },
    ),
  ),
);

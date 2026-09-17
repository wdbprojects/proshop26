import { useCartQuery } from "@/hooks/use-cart-query";

/* For anything that just needs "how many items are in the cart" (header badge, mini-cart icon, etc). Shares the exact same React Query cache entry as useCartPage - same queryKey, same data - so it updates the instant any add/update/remove mutation writes to that cache, with no separate fetch and no risk of drifting from what the cart page shows. */

export const useCartCount = () => {
  const { data, isLoading } = useCartQuery();
  /* Sum of quantities, not number of distinct line items - the usual ecommerce convention (2 shirts + 1 hat shows "3", not "2"). Swap to `data?.cart.items.length` if you would rather badge = distinct products. */

  const count = data?.cart.items.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  return { count, isLoading };
};

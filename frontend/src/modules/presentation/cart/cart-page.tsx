"use client";

import { useCartPage } from "@/hooks/use-cart-page";

import CartSkeleton from "@/modules/components/cart/cart-skeletons";
import EmptyCart from "@/modules/components/cart/empty-cart";
import { ShoppingCartIcon } from "lucide-react";
import CartItems from "@/modules/components/cart/cart-items";
import ErrorCard from "@/components/shared/error-card";

const CartPage = () => {
  const {
    checkout,
    checkoutLoading,
    items,
    lines,
    productsError,
    productsLoading,
    removeItem,
    setQuantity,
    subTotal,
  } = useCartPage();

  return (
    <div className="block h-full w-full space-y-12 p-4">
      <div>
        <h1 className="text-foreground mb-8 flex items-center gap-2 text-3xl font-semibold">
          <ShoppingCartIcon className="text-primary size-8" />
          <span>Cart</span>
        </h1>
        {items.length <= 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            <EmptyCart />
          </div>
        ) : productsLoading ? (
          <CartSkeleton lines={items.length} />
        ) : productsError ? (
          <div className="flex h-full w-full items-center justify-center">
            <ErrorCard />
          </div>
        ) : (
          <CartItems
            lines={lines}
            setQuantity={setQuantity}
            removeItem={removeItem}
            subTotal={subTotal}
            checkout={checkout}
            checkoutLoading={checkoutLoading}
          />
        )}
      </div>
    </div>
  );
};
export default CartPage;

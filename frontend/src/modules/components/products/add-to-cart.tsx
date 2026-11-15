"use client";

import { useState } from "react";
import Quantity from "@/modules/components/products/quantity";
import { useAddToCart } from "@/hooks/use-add-to-cart";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Ban, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

interface AddToCartProps {
  productId: string;
  stock: number;
}

const AddToCart = ({ productId, stock }: AddToCartProps) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAddToCart();

  const outOfStock = stock <= 0;

  /* Derived during render instead of synced via an effect. If stock drops below the raw selected quantity, this clamps it for both display and the mutation - no setState-in-effect, and as a bonus, if stock later recovers the user's original selection reappears instead of being permanently overwritten. */
  const effectiveQuantity = Math.min(quantity, Math.max(stock, 1));

  const buying = addToCart.isPending && addToCart.variables?.silent === true;
  const adding = addToCart.isPending && !buying;

  const handleAddToCart = () => {
    addToCart.mutate({ productId, quantity: effectiveQuantity });
  };

  const handleBuyNow = () => {
    addToCart.mutate(
      { productId: productId, quantity: effectiveQuantity, silent: true },
      { onSuccess: () => router.push(routes.checkout) },
    );
  };

  return (
    <div>
      <div className="mb-0 block">
        <Quantity
          value={quantity}
          onChange={setQuantity}
          max={stock}
          disabled={outOfStock || addToCart.isPending}
        />
      </div>
      <Separator className="my-4" />
      <div className="mt-4 mb-4 flex flex-col gap-3">
        <Button
          size="default"
          variant="default"
          onClick={handleAddToCart}
          disabled={outOfStock || addToCart.isPending}
        >
          {outOfStock ? (
            <div className="flex items-center justify-center gap-2">
              <Ban className="size-3" aria-hidden />
              <span className="font-bold">Out of stock</span>
            </div>
          ) : adding ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner />
              <span>Adding...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Plus />
              <span>Add to Card</span>
            </div>
          )}
        </Button>
        <Button
          size="default"
          variant="secondary"
          onClick={handleBuyNow}
          disabled={outOfStock || addToCart.isPending}
        >
          {buying ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner />
              <span>Redirecting...</span>
            </div>
          ) : (
            <span>Buy now</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddToCart;

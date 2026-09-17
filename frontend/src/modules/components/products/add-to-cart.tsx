"use client";

import { useEffect, useState } from "react";
import Quantity from "@/modules/components/products/quantity";
import { useAddToCart } from "@/hooks/use-add-to-cart";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Ban, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface AddToCartProps {
  productId: string;
  stock: number;
}

const AddToCart = ({ productId, stock }: AddToCartProps) => {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAddToCart();

  const outOfStock = stock <= 0;

  /* Derived during render instead of synced via an effect. If stock drops below the raw selected quantity, this clamps it for both display and the mutation - no setState-in-effect, and as a bonus, if stock later recovers the user's original selection reappears instead of being permanently overwritten. */

  const effectiveQuantity = Math.min(quantity, Math.max(stock, 1));

  const handleAddToCart = () => {
    addToCart.mutate({ productId, quantity: effectiveQuantity });
    // toast.success(`${quantity} item(s) added to cart`);
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
          ) : addToCart.isPending ? (
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
        <Button size="default" onClick={() => {}} variant="secondary">
          Buy Now
        </Button>
      </div>
    </div>
  );
};

export default AddToCart;

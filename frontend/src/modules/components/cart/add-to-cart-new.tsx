"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAddToCart } from "@/hooks/use-add-to-cart";

interface AddToCartNewProps {
  productId: string;
  quantity?: number;
}

const AddToCartNew = ({ productId, quantity = 1 }: AddToCartNewProps) => {
  const addToCart = useAddToCart();

  const handleAddToCart = () => {
    return addToCart.mutate({ productId, quantity });
  };

  return (
    <Button
      className="w-full"
      type="button"
      onClick={handleAddToCart}
      disabled={addToCart.isPending}
    >
      {addToCart.isPending ? (
        <div className="flex items-center justify-center gap-2">
          <Spinner className="size-3" />
          <span>Adding...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <Plus className="size-3" />
          <span>Add to Cart</span>
        </div>
      )}
    </Button>
  );
};

export default AddToCartNew;

"use client";

import { Spinner } from "@/components/ui/spinner";
import { useRateProduct } from "@/hooks/use-rate-product";
import ProductRatings from "@/modules/components/products/product-ratings";

const RateProduct = ({
  orderId,
  productId,
  myRating,
}: {
  orderId: string;
  productId: string;
  myRating: number | null;
}) => {
  const rate = useRateProduct(orderId);

  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-foreground/65 text-xs">
        {myRating ? "Your rating" : "Rate this product"}
      </span>
      <ProductRatings
        value={myRating ?? 0}
        size={18}
        showCount={false}
        onChange={(rating) => {
          if (rate.isPending) return;
          rate.mutate({ productId, rating });
        }}
      />
      {rate.isPending && <Spinner className="size-3" />}
    </div>
  );
};

export default RateProduct;

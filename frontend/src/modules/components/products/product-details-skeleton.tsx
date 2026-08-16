import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const ProductDetailsSkeleton = () => {
  return (
    <div className="mt-4 grid gap-10 p-4 lg:grid-cols-[1fr_320px]">
      <Skeleton className="aspect-square w-full rounded-md" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;

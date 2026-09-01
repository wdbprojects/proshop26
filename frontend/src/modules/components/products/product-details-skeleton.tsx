import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const ProductDetailsSkeleton = () => {
  return (
    <div className="p-4 px-1 pb-4 sm:p-2 lg:p-4">
      {/* BREADCRUMB */}
      <nav className="text-muted-foreground rounded-md text-sm">
        <Skeleton className="h-6 w-70" />
      </nav>
      <div className="mt-6 grid grid-cols-12 justify-between gap-6 p-2 sm:p-4">
        <div className="col-span-12 w-full p-0 sm:order-1 sm:col-span-12 lg:order-2 lg:col-span-4">
          <Skeleton className="aspect-square w-full rounded-md" />
        </div>

        <Skeleton className="col-span-12 flex h-full w-full flex-col space-y-4 rounded-md p-4 text-left sm:order-3 lg:order-2 lg:col-span-5">
          <Skeleton className="h-8 w-3/4 bg-white" />
          <Skeleton className="h-12 w-1/2 bg-white" />
          <Skeleton className="h-40 w-full bg-white" />
        </Skeleton>

        <div className="bg-muted col-span-12 w-full rounded-md px-4 py-4 sm:order-2 sm:col-span-5 lg:order-3 lg:col-span-3">
          <Skeleton className="aspect-square h-full w-full space-y-6 rounded-md">
            <Skeleton className="h-8 w-3/4 bg-white" />
            <Skeleton className="h-12 w-full bg-white" />
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;

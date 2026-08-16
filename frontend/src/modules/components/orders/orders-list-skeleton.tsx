"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const OrdersListSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((item) => {
        return (
          <Card key={item} className="">
            <CardContent className="flex flex-row flex-wrap items-center gap-4 shadow-sm">
              <Skeleton className="size-22 shrink-0" />
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56 max-w-full" />
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-24 shrink-0" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OrdersListSkeleton;

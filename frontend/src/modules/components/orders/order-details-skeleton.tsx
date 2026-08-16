import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const OrderDetailsSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-9 w-40" />
      <Card className="overflow-hidden">
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-48 max-w-full" />
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="h-3 w-full max-w-full" />
            </div>
            <div className="border-card/80 space-y-3 border-t px-5 pt-4 lg:border-t-0 lg:pt-0 lg:text-right">
              <Skeleton className="h-8 w-20 rounded-full lg:ml-auto" />
              <Skeleton className="h-10 w-32 lg:ml-auto" />
            </div>
          </div>
        </div>
        <div className="border-card/80 border-t px-5 pt-4 sm:px-8 lg:border-t-0 lg:pt-0 lg:text-right">
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-4 w-full max-w-xl" />
        </div>
      </Card>
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
};

export default OrderDetailsSkeleton;

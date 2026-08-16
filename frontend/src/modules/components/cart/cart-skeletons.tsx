import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
/* CART SKELETON */
const CartSkeleton = ({ lines = 3 }: { lines: number }) => {
  const n = Math.min(Math.max(lines, 3), 8);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-4">
        {Array.from({ length: n }).map((_, index) => {
          return (
            <Card
              key={index}
              className="flex flex-row justify-between gap-0 p-0"
            >
              <div className="p-4">
                <Skeleton className="h-24 w-24 rounded-md" />
              </div>
              <CardContent className="min-w-0 flex-1 flex-row flex-wrap items-center justify-between gap-4 px-4 py-4">
                <div className="min-w-0 flex-1 space-y-3">
                  <Skeleton className="h-6 w-48 max-w-full" />
                  <Skeleton className="h-6 w-28" />
                  <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
              <Skeleton className="mt-4 mr-4 h-6 w-20" />
            </Card>
          );
        })}
      </ul>
      <Card className="card border-base-300 bg-base-100 border p-6 shadow-md">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mt-6 h-12 w-full rounded-lg" />
        <Skeleton className="mt-4 h-10 w-full" />
      </Card>
    </div>
  );
};

export default CartSkeleton;

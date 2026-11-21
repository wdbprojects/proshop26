"use client";

import { useWishlistProducts } from "@/hooks/use-wishlist";
import ErrorCard from "@/components/shared/error-card";
import { HeartIcon } from "lucide-react";
import CatalogProductCard from "@/modules/components/catalog/catalog-product-card";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/config/routes";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const GRID =
  "grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5";

const WishlistPage = () => {
  const { data, isLoading, isError } = useWishlistProducts();

  if (isError) return <ErrorCard />;
  const list = data?.products ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <HeartIcon className="text-primary size-7" />
          <span>My wishlist</span>
        </h1>
        {!isLoading && (
          <p className="text-muted-foreground text-sm">
            {list.length} saved {list.length === 1 ? "product" : "products"}
          </p>
        )}
      </div>
      {isLoading ? (
        <ul className={GRID}>
          {Array.from({ length: 5 }).map((_, index) => {
            return (
              <li key={index} className="space-y-2">
                <Skeleton className="aspect-4/5 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
              </li>
            );
          })}
        </ul>
      ) : list.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <HeartIcon className="text-muted-foreground size-10" />
            <p className="font-medium">Your wishlist is empty</p>
            <p className="text-muted-foreground max-w-sm text-sm">
              Tap the heart on any product to save it here for later.
            </p>
            <Link
              href={routes.catalog}
              className={buttonVariants({ variant: "default" })}
            >
              Browse products
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className={GRID}>
          {list.map((product) => {
            return (
              <li key={product.id}>
                <CatalogProductCard product={product} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default WishlistPage;

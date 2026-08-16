"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { ICategories } from "@/config/types";
import { cn } from "@/lib/utils";

import { ArrowRightIcon, ShoppingCart, SparkleIcon } from "lucide-react";
import Link from "next/link";

const HomeHero = ({ categories, loadingCategories }: ICategories) => {
  return (
    <section className="border-base-300 from-base-100 via-base-100 to-primary/10 relative overflow-hidden rounded-md border bg-linear-to-br shadow-lg">
      <div
        className="bg-primary/10 absolute top-0 right-0 h-64 w-64 translate-x-1/4 -translate-y-1/4 rounded-full blur-3xl"
        aria-hidden
      />

      <div className="relative grid gap-8 p-8 md:grid-cols-2 md:items-center md:p-12 lg:p-14">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Hardware &amp; workspace,{" "}
            <span className="text-primary">ready to ship</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg text-base leading-relaxed">
            Audio, wearables, workspace, and travel—curated for work and home.
            Secure checkout; after payment, use your order page for support chat
            and video.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={routes.catalog}
              className={cn(
                buttonVariants({
                  size: "lg",
                  variant: "default",
                }),
              )}
            >
              <span>Shop Catalog</span>
              <ArrowRightIcon className="size-3.5" />
            </Link>
            <Link
              href={routes.cart}
              className={cn(
                buttonVariants({
                  size: "lg",
                  variant: "outline",
                }),
              )}
            >
              <span>View Cart</span>
              <ShoppingCart className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <Card className="max-w-auto @container/card w-full items-start justify-start gap-1 px-4 py-2 text-start">
            <p className="text-base-content/50 m-0 mb-0 p-0 text-center uppercase">
              Categories
            </p>
            <div className="mt-0 flex items-center justify-center p-0 text-center text-2xl font-bold tabular-nums">
              {loadingCategories ? (
                <Skeleton className="h-8 w-8 rounded-md" />
              ) : (
                <span className="text-primary">{categories?.length}</span>
              )}
            </div>
            <p className="text-muted-foreground text-center text-xs">
              Curated Groups
            </p>
          </Card>

          <div className="border-primary/30 bg-primary/5 rounded-md border border-dashed px-4 py-3!">
            <div className="flex items-center gap-2 text-sm font-medium">
              <SparkleIcon className="text-primary size-4" />
              Secure checkout - Priority support on paid orders
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;

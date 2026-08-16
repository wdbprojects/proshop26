"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/config/routes";
import { ProductCreateSchemaType } from "@/config/type-schemas";
import { IK_PRESETS, imageKitOptimizedUrl } from "@/lib/image-kit-url";
import { formatPriceNew } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

const CatalogProductCard = ({
  product,
}: {
  product: ProductCreateSchemaType;
}) => {
  const addItem = useCart((state) => {
    return state.addItem;
  });

  return (
    <Card className="bg-muted relative mx-auto h-full w-full gap-2 rounded-md px-0 pt-0 ring-0 transition-all hover:shadow-xl">
      <div className="p-0">
        <Link
          href={routes.productDetails(product.slug)}
          className="overflow-hidden"
        >
          <figure className="bg-background aspect-5/3">
            {product.imageUrl ? (
              <Image
                src={imageKitOptimizedUrl(
                  product.imageUrl,
                  IK_PRESETS.catalogCard,
                )}
                width={IK_PRESETS.catalogCard.w}
                height={IK_PRESETS.catalogCard.h}
                alt={product.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                loading="eager"
                decoding="async"
              />
            ) : null}
          </figure>
          <Badge className="absolute top-3 left-3" variant="secondary">
            {product?.category ?? "General"}
          </Badge>
        </Link>
      </div>
      <div className="flex h-full flex-col items-center justify-between">
        <div className="w-full">
          <CardHeader className="mb-0 w-full p-0 px-2 pb-0">
            <CardTitle className="px-0">
              <Link
                href={routes.productDetails(product.slug)}
                className="hover:text-primary line-clamp-2 text-base font-light transition-all"
              >
                {product.name}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardDescription className="text-muted-foreground line-clamp-3 px-2 text-sm leading-tight">
            {product?.description}
          </CardDescription>
        </div>
        <CardAction className="mt-2 flex w-full flex-row items-center justify-between px-2">
          <span className="text-lg font-bold tabular-nums">
            {formatPriceNew(Number(product.price), product.currency)}
          </span>
          <Button
            onClick={() => {
              addItem(product.id, 1);
              toast.success(
                `Product "${product.name}" added to cart successfully`,
              );
            }}
            variant="default"
            size="sm"
          >
            <PlusIcon className="size-4" aria-hidden />
            <span className="font-bold">Add</span>
          </Button>
        </CardAction>
      </div>
    </Card>
  );
};

export default CatalogProductCard;

"use client";

import { useCart } from "@/store/cart";

import ProductBreadcrumb from "./product-breadcrumb";
import Image from "next/image";
import {
  IK_PRESETS,
  imageKitOptimizedUrl,
  imageKitWatermarkedUrl,
} from "@/lib/image-kit-url";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckIcon,
  ExternalLinkIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HIGHLIGHTS } from "@/config/data";
import { routes } from "@/config/routes";
import { toast } from "sonner";
import { ProductCreateSchemaType } from "@/config/type-schemas";

const ProductDetailsContent = ({
  product,
}: {
  product: ProductCreateSchemaType;
}) => {
  const addToCart = useCart((state) => {
    return state.addItem;
  });

  const category = product.category ?? "All";
  const watermarkedFullUrl = product.imageUrl
    ? imageKitWatermarkedUrl(product.imageUrl, IK_PRESETS.productHero)
    : null;

  return (
    <div className="p-4">
      {/* BREADCRUMB */}
      <nav className="text-muted-foreground text-sm">
        <ProductBreadcrumb productName={product.name} />
      </nav>
      {/* CONTENT */}
      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Card className="gap-0 space-y-0 overflow-hidden border-none py-0 ring-0">
          <figure className="bg-background mb-0 aspect-square">
            {product.imageUrl ? (
              <Image
                src={imageKitOptimizedUrl(
                  product.imageUrl,
                  IK_PRESETS.productHero,
                )}
                width={1200}
                height={1200}
                alt={product.name}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full" />
            )}
          </figure>

          {watermarkedFullUrl ? (
            <div className="border-foreground/10 bg-background/40 mt-0 flex flex-wrap items-center gap-2 border-t px-3 py-2">
              <Link
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "flex items-center justify-center gap-2",
                )}
                href={watermarkedFullUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="size-3.5" aria-hidden />
                Open full size
              </Link>
            </div>
          ) : null}
        </Card>

        <div className="flex flex-col text-left">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{category}</Badge>
            <span className="text-muted-foreground/45 font-mono text-xs">
              {product.slug}
            </span>
          </div>
          <h1 className="text-foreground mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {product.name}
          </h1>
          <p className="text-primary mt-3 text-3xl font-bold tabular-nums md:text-4xl">
            {formatPrice(product.priceCents, product.currency)}
          </p>
          <p className="text-muted-foreground mt-6 text-base leading-relaxed">
            {product.description}
          </p>
          <ul className="border-muted/30 bg-muted/40 mt-6 space-y-2 rounded-md border px-4 py-3 shadow-sm">
            {HIGHLIGHTS.map((item) => {
              return (
                <li
                  key={item}
                  className="text-foreground/80 flex items-center justify-start gap-2 text-sm"
                >
                  <CheckIcon className="text-primary size-4 shrink-0" />
                  <span>{item}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="default"
              onClick={() => {
                addToCart(product.id);
                toast.success(
                  `Product "${product.name}" added to cart successfully`,
                );
              }}
              className="flex min-w-50 items-center justify-center gap-2"
            >
              <ShoppingCartIcon className="size-5" />
              <span>Add to cart</span>
            </Button>
            <Link
              href={routes.home}
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
                "text-foreground/70 flex min-w-50 items-center justify-center",
              )}
            >
              <ArrowLeft className="size-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsContent;

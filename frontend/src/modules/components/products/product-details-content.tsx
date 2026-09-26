"use client";

import { useState } from "react";
import { routes } from "@/config/routes";
import { Separator } from "@/components/ui/separator";
import LongDescription from "@/modules/components/products/description";
import ProductBreadcrumb from "@/modules/components/products/product-breadcrumb";
import { PriceTag } from "./pricetag";
import Image from "next/image";
import {
  IK_PRESETS,
  imageKitOptimizedUrl,
  imageKitWatermarkedUrl,
} from "@/lib/image-kit-url";
import Link from "next/link";
import { cn, formatPriceNew } from "@/lib/utils";
import { ProductImageType, ProductType } from "@/config/type-schemas";
import ProductRatings from "./product-ratings";
import { HIGHLIGHTS } from "@/config/data";
import AddToCart from "@/modules/components/products/add-to-cart";

import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, CheckIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ProductDetailsContent = ({
  product,
  primaryImage,
}: {
  product: ProductType;
  primaryImage: ProductImageType;
}) => {
  const [ratings, setRatings] = useState<number | null>(2.5);
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string>(
    primaryImage?.url ?? "",
  );

  const category = product.category ?? "All";

  /* const watermarkedFullUrl = primaryImage?.url
    ? imageKitWatermarkedUrl(primaryImage?.url, IK_PRESETS.productHero)
    : null; */

  return (
    <div className="p-4 px-1 pb-4 sm:p-2 lg:p-4">
      {/* BREADCRUMB */}
      <nav className="text-muted-foreground text-sm">
        <ProductBreadcrumb productName={product.name} />
      </nav>
      {/* CONTENT */}
      <div className="mt-6 grid grid-cols-12 justify-between gap-6 p-2 sm:p-4">
        {/* LEFT */}
        <div className="col-span-12 w-full p-0 sm:order-1 sm:col-span-12 lg:order-2 lg:col-span-5">
          <Card className="bg-muted gap-0 space-y-0 overflow-hidden rounded-none border-none py-2 ring-0">
            <CardContent className="px-2">
              <figure className="bg-background mb-0 aspect-square">
                {primaryImage ? (
                  <Image
                    src={imageKitOptimizedUrl(
                      mainPhotoUrl,
                      IK_PRESETS.productHero,
                    )}
                    width={1200}
                    height={1200}
                    alt={primaryImage.alt ? primaryImage.alt : product.name}
                    fetchPriority="high"
                    decoding="async"
                    className={cn("h-full w-full object-cover")}
                  />
                ) : (
                  <div className="h-full w-full" />
                )}
              </figure>
            </CardContent>

            {/* {watermarkedFullUrl ? (
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
            ) : null} */}
            <CardFooter className="mt-2 flex flex-row gap-2 p-2">
              {product?.images &&
                product.images?.map((img, index) => {
                  return (
                    <Image
                      key={index}
                      src={imageKitOptimizedUrl(img.url, IK_PRESETS.cartThumb)}
                      // src={img.url}
                      width={100}
                      height={100}
                      alt={img.alt || ""}
                      className={cn(
                        "cursor-pointer object-cover transition-all",
                        mainPhotoUrl === img.url && "border-2 border-green-500",
                      )}
                      onMouseEnter={() => {
                        const nextUrl = product.images?.[index]?.url ?? "";
                        setMainPhotoUrl(nextUrl);
                      }}
                    />
                  );
                })}
            </CardFooter>
          </Card>
        </div>
        {/* CENTER */}
        <div className="dark:bg-muted/40! bg-muted! col-span-12 flex h-full w-full flex-col px-4 py-2 text-left sm:order-3 lg:order-2 lg:col-span-4">
          {/* HEADER & TITLE */}
          <div className="flex flex-wrap items-center gap-0">
            <Badge variant="secondary">{category.name}</Badge>
            <span className="text-muted-foreground/45 ml-2 font-mono text-xs">
              {product.slug}
            </span>
            {/* NAME */}
            <h1 className="text-foreground mt-3 mb-0 text-2xl font-semibold tracking-tight md:text-3xl">
              {product.name}
            </h1>
            {/* SHORT DESCRIPTION */}
            <p className="text-muted-foreground mt-0 text-base leading-relaxed">
              {product.description}
            </p>
          </div>
          {/* RATINGS */}
          <div className="mt-3 flex items-center justify-start gap-2">
            <ProductRatings
              value={ratings}
              onChange={setRatings}
              numReviews={product?.numReviews ?? 0}
            />
          </div>
          <Separator className="my-2" />
          {/* RATINGS */}
          <PriceTag price={product?.priceCents} currency={product?.currency} />
          <Separator className="my-2" />
          {/* LONG DESCRIPTION */}
          <LongDescription longDescription={product?.longDescription} />
          <Separator className="my-2" />
          {/* PRODUCT DATA */}
          <div className="mt-2 flex flex-wrap gap-3">
            <ul className="w-full text-sm">
              <li className="mb-1 grid grid-cols-[125px_1fr]">
                <span className="font-bold">Seller:</span> Amazon
              </li>
              <li className="mb-1 grid grid-cols-[125px_1fr]">
                <span className="font-bold">Category:</span>{" "}
                {product?.category?.name}
              </li>
              <li className="mb-1 grid grid-cols-[125px_1fr]">
                <span className="font-bold">Dimensions:</span> 59&quot;D x
                47&quot;W x 29&quot;H
              </li>
              <li className="mb-1 grid grid-cols-[125px_1fr] overflow-x-auto">
                <span className="font-bold">SKU:</span>{" "}
                <span className="wrap-break-word">{product?.id}</span>
              </li>
            </ul>
          </div>
          <Separator className="my-2" />
        </div>
        {/*  RIGHT */}
        <div className="col-span-12 w-full border px-4 py-0 pb-2 sm:order-2 sm:col-span-5 lg:order-3 lg:col-span-3">
          <div className="text-foreground mt-3 text-3xl font-semibold tabular-nums md:text-4xl">
            {formatPriceNew(Number(product?.priceCents), product.currency)}
          </div>
          <Separator className="mt-2" />
          <div className={cn("text-s mt-2 mb-0 w-full px-0")}>
            {product?.stock <= 3 && product.stock > 0 ? (
              <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                Only {product.stock} in stock
              </Badge>
            ) : product.stock < 1 ? (
              <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                Currently out of stock!
              </Badge>
            ) : (
              <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                In stock!!
              </Badge>
            )}
          </div>
          <Separator className="my-3" />
          {/* ADD TO CART WITH QUANTITY SELECTOR */}
          <AddToCart productId={product.id} stock={product.stock} />
          {/* HIGHLIGHTS */}
          <ul className="border-muted/30 bg-muted/40 mt-2 space-y-2 rounded-none border px-2 py-3 shadow-sm">
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
          <Separator className="my-4" />
          {/* OTHER ACTIONS */}
          <div>
            <Link
              href={routes.products}
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

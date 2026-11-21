"use client";

import { routes } from "@/config/routes";
import { Separator } from "@/components/ui/separator";
import LongDescription from "@/modules/components/products/description";
import ProductBreadcrumb from "@/modules/components/products/product-breadcrumb";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductType } from "@/config/type-schemas";
import ProductRatings from "./product-ratings";
import { HIGHLIGHTS } from "@/config/data";
import AddToCart from "@/modules/components/products/add-to-cart";

import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProductGallery from "./product-gallery";
import PriceBlock from "@/modules/components/products/price-block";
import DeliveryNote from "@/modules/components/products/delivery-note";
import WishlistButton from "../wishlist/wishlist-button";

const ProductDetailsContent = ({ product }: { product: ProductType }) => {
  /* const watermarkedFullUrl = primaryImage?.url
    ? imageKitWatermarkedUrl(primaryImage?.url, IK_PRESETS.productHero)
    : null; */

  return (
    <div className="p-4 px-1 pb-4 sm:p-2 lg:p-4">
      {/* BREADCRUMB */}
      <nav className="text-muted-foreground text-sm">
        <ProductBreadcrumb productName={product.name} />
      </nav>
      <div className="mt-6 grid grid-cols-12 justify-between gap-6 p-2 sm:p-4">
        {/* LEFT - GALLERY */}
        <div className="col-span-12 w-full p-0 sm:order-1 sm:col-span-12 lg:order-2 lg:col-span-5">
          <ProductGallery images={product.images ?? []} name={product.name} />
        </div>

        {/* CENTER - PRODUCT INFO */}
        <div className="bg-muted/60 col-span-12 flex h-full flex-col rounded-lg px-4 py-3 text-left sm:order-3 lg:order-2 lg:col-span-4">
          <div>
            {product.category?.name && (
              <Badge variant="secondary">{product.category.name}</Badge>
            )}
            <h1 className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>
          <div className="mt-2">
            <ProductRatings
              value={Number(product.rating)}
              numReviews={product.numReviews}
              size={14}
            />
          </div>
          <Separator className="my-3" />
          <PriceBlock
            listCents={product.priceCents}
            currency={product.currency}
            large
            note
          />
          <Separator className="my-3" />

          {product.longDescription && (
            <>
              <LongDescription longDescription={product.longDescription} />
              <Separator className="my-3" />
            </>
          )}

          <ul className="w-full text-sm">
            {product.brand && (
              <li className="mb-1 grid grid-cols-[110px_1fr]">
                <span className="font-bold">Brand:</span>
                <span>{product.brand}</span>
              </li>
            )}
          </ul>
        </div>
        {/* RIGHT - CALL TO ACTION */}
        <div className="col-span-12 w-full rounded-lg border px-4 py-0 pb-2 sm:order-2 sm:col-span-5 lg:order-3 lg:col-span-3">
          <PriceBlock
            listCents={product.priceCents}
            currency={product.currency}
            large
            className="mt-3"
          />
          <Separator className="mt-2" />
          <div className="mt-2 w-full">
            {product.stock > 0 && product.stock <= 3 ? (
              <Badge className="bg-purple-50">
                Only {product.stock} in stock
              </Badge>
            ) : product.stock < 1 ? (
              <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                Currently out of stock
              </Badge>
            ) : (
              <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                In stock
              </Badge>
            )}
          </div>
          <Separator className="my-3" />
          <AddToCart productId={product.id} stock={product.stock} />
          <WishlistButton
            productId={product.id}
            variant="full"
            className="w-full"
          />
          <DeliveryNote />
          <ul className="border-muted/30 bg-muted/40 mt-2 space-y-2 border px-2 py-3 shadow-sm">
            {HIGHLIGHTS.map((item) => {
              return (
                <li
                  key={item}
                  className="text-foreground/80 flex items-center gap-2 text-sm"
                >
                  <CheckIcon className="text-primary size-4 shrink-0" />
                  <span>{item}</span>
                </li>
              );
            })}
          </ul>
          <Separator className="my-4" />
          <Link
            href={routes.catalog}
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
  );
};

export default ProductDetailsContent;

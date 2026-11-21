"use client";

import { routes } from "@/config/routes";
import { IK_PRESETS, imageKitOptimizedUrl } from "@/lib/image-kit-url";
import { cn } from "@/lib/utils";
import { PackageIcon, PlusIcon, TruckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@/config/type-schemas";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { Spinner } from "@/components/ui/spinner";
import { onlinePriceCents } from "@/lib/pricing";
import { DELIVERY_SHORT, ONLINE_DISCOUNT_PERCENT } from "@/config/store";
import ProductRatings from "@/modules/components/products/product-ratings";
import PriceBlock from "@/modules/components/products/price-block";
import WishlistButton from "@/modules/components/wishlist/wishlist-button";

const LOW_STOCK = 5;

const CatalogProductCard = ({ product }: { product: ProductType }) => {
  const addToCart = useAddToCart();

  const image =
    product.images?.find((img) => {
      return img.isPrimary;
    }) ?? product.images?.[0];
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK;
  const rating = Number(product.rating);
  const discounted = onlinePriceCents(product.priceCents) < product.priceCents;
  const href = routes.productDetails(product.slug);

  return (
    <article className="group bg-card flex h-full flex-col overflow-hidden rounded-xl border transition hover:shadow-lg">
      <div className="relative">
        <Link href={href} className="relative block aspect-4/5 bg-white">
          {image ? (
            <Image
              src={
                imageKitOptimizedUrl(image.url, IK_PRESETS.catalogCard) ??
                image.url
              }
              alt={image.alt || product.name}
              fill
              sizes="(min-width: 1536px) 16vw, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className={cn(
                "object-contain p-3 transition duration-300 group-hover:scale-[1.03]",
                outOfStock && "opacity-40",
              )}
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <PackageIcon className="size-12" aria-hidden />
            </div>
          )}
        </Link>

        {discounted && !outOfStock && (
          <span className="absolute top-2 left-2 rounded-md bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
            -{ONLINE_DISCOUNT_PERCENT}% online
          </span>
        )}
        {outOfStock && (
          <span className="bg-background/90 absolute inset-x-0 top-1/2 -translate-y-1 py-1 text-center text-sm font-semibold">
            Sold out
          </span>
        )}
        <WishlistButton
          productId={product.id}
          className="absolute top-0.5 right-0.5"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link
          href={href}
          className="hover:text-primary line-clamp-2 min-h-10 text-sm leading-5 font-medium transition-colors"
        >
          {product.name}
        </Link>
        {product.numReviews > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tabular-nums">
              {rating.toFixed(1)}
            </span>
            <ProductRatings value={rating} size={13} showCount={false} />
            <span className="text-muted-foreground text-xs tabular-nums">
              ({product.numReviews})
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">No ratings yet</span>
        )}

        <PriceBlock
          listCents={product.priceCents}
          currency={product.currency}
        />

        <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
          <TruckIcon className="size-3 shrink-0" aria-hidden />
          <span>{DELIVERY_SHORT}</span>
        </p>

        {lowStock && (
          <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
            Only {product.stock} left
          </p>
        )}

        <div className="mt-auto pt-2">
          <Button
            size="sm"
            className="w-full"
            disabled={addToCart.isPending || outOfStock}
            onClick={() => {
              return addToCart.mutate({ productId: product.id, quantity: 1 });
            }}
          >
            {outOfStock ? (
              <>
                <Spinner className="size-3" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <PlusIcon className="size-3.5" />
                <span>Add to cart</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default CatalogProductCard;

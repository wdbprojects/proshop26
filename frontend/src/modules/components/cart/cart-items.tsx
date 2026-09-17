"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { IK_PRESETS, imageKitOptimizedUrl } from "@/lib/image-kit-url";
import { cn, formatPriceNew } from "@/lib/utils";
import LoginButton from "@/modules/components/auth/login-button";
import { routes } from "@/config/routes";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { ICartItemHydrated } from "@/types/cart";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  HeadphonesIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from "lucide-react";

interface ICartItemProps {
  items: ICartItemHydrated[];
  /* NOTE: takes the cart_item's own id (item.id), not productId - that's what the PATCH/DELETE endpoints key on. */
  setQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  subTotal: number;
  checkout: () => void;
  checkoutLoading: boolean;
}

const CartItems = ({
  items,
  setQuantity,
  removeItem,
  subTotal,
  checkout,
  checkoutLoading,
}: ICartItemProps) => {
  const { data, isPending, refetch } = authClient.useSession();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isPending) {
    return <div>Loading session...</div>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-4">
        {items.map((item) => {
          return (
            <Card
              key={item.id}
              className="flex flex-row gap-0 space-y-0 py-1 pl-1"
            >
              <div className="w-auto">
                <figure className="p-2">
                  {item.image ? (
                    <Image
                      src={imageKitOptimizedUrl(
                        item.image,
                        IK_PRESETS.cartThumb,
                      )}
                      width={IK_PRESETS.cartThumb.w}
                      height={IK_PRESETS.cartThumb.h}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="bg-muted h-24 w-24 rounded-md object-cover"
                    />
                  ) : (
                    <div className="bg-accent h-24 w-24 rounded-md" />
                  )}
                </figure>
              </div>
              <div className="flex w-full flex-1 flex-row items-start justify-between gap-4">
                <div className="flex h-auto w-full flex-col justify-between gap-0 space-y-2! px-2 pt-2 pb-2 pl-4">
                  <div className="mb-0">
                    <h2>
                      <Link
                        href={routes.productDetails(item.slug)}
                        className={cn(
                          buttonVariants({ size: "sm", variant: "link" }),
                          "pl-0 text-lg",
                        )}
                      >
                        {item.name}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {formatPriceNew(item.priceCents, item.currency)} each
                    </p>
                    {item.priceCentsAtAdd !== item.priceCents ? (
                      <p className="text-xs text-amber-600">
                        Price changed since you added this (was{" "}
                        {formatPriceNew(item.priceCentsAtAdd, item.currency)})
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-foreground text-sm font-semibold">
                      Quantity
                    </span>
                    <div className="mr-4 flex items-center justify-start gap-2">
                      <Button
                        variant="outline"
                        size="icon-lg"
                        className=""
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        aria-label={
                          item.quantity <= 1
                            ? "Remove from cart"
                            : "Decrease quantity"
                        }
                      >
                        <MinusIcon className="size-4" aria-hidden />
                      </Button>
                      <Badge
                        variant="destructive"
                        className="text-foreground rounded-md p-3 text-base font-medium tabular-nums"
                        aria-live="polite"
                      >
                        {item.quantity}
                      </Badge>
                      <Button
                        variant="outline"
                        size="icon-lg"
                        className=""
                        onClick={() => {
                          setQuantity(
                            item.id,
                            Math.min(item.stock, item.quantity + 1),
                          );
                        }}
                        disabled={
                          item.quantity >= 99 || item.quantity >= item.stock
                        }
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="size-4" aria-hidden />
                      </Button>
                    </div>
                    <Button
                      className="group text-destructive/40 hover:text-destructive"
                      variant="secondary"
                      aria-label="Remove from cart"
                      title="Remove from cart"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2Icon className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>

                <div className="text-foreground pt-2 pr-4 text-right text-xl font-semibold">
                  {formatPriceNew(
                    item.priceCents * item.quantity,
                    item.currency,
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </ul>
      <Card className="max-w-120 p-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground text-xl font-semibold">
            {formatPriceNew(subTotal, items[0]?.currency ?? "usd")}
          </span>
        </div>
        <hr className="" />

        {!data?.session ? (
          <LoginButton variant="secondary" text="Login to Checkout" />
        ) : (
          <Button
            onClick={checkout}
            disabled={checkoutLoading}
            aria-busy={checkoutLoading}
            variant="default"
            size="lg"
          >
            {checkoutLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner />
                <span>Opening checkout...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <ShoppingCartIcon className="size-4" aria-hidden />
                <span>Checkout securely</span>
              </div>
            )}
          </Button>
        )}

        <p className="text-muted-foreground mt-4 flex items-start justify-center gap-2 text-xs">
          <HeadphonesIcon
            className="text-primary mt-0.5 size-3.5"
            aria-hidden
          />
          <span>
            After payment, open your order for
            <strong className="text-foreground"> support chat</strong>. Video
            invites appear that thread.
          </span>
        </p>
      </Card>
    </div>
  );
};

export default CartItems;

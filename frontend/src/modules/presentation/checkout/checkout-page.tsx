"use client";

import ErrorCard from "@/components/shared/error-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useCartQuery } from "@/hooks/use-cart-query";
import { useCheckout } from "@/hooks/use-checkout";
import { formatPrice } from "@/lib/utils";
import EmptyCart from "@/modules/components/cart/empty-cart";
import ShippingForm from "@/modules/components/checkout/shipping-form";
import { LockIcon, TruckIcon } from "lucide-react";

const CheckoutPage = () => {
  const { data, isLoading, isError } = useCartQuery();
  const checkout = useCheckout();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <Spinner className="text-primary size-12" />
      </div>
    );
  }

  if (isError) {
    return <ErrorCard />;
  }

  const items = data?.cart.items ?? [];
  if (items.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <EmptyCart />
      </div>
    );
  }

  /* after success the browser is navigatin to Polar - keep the button locked until it leaves */
  const busy = checkout.isPending || checkout.isSuccess;

  return (
    <div className="space-y-8 p-4">
      <h1>
        <TruckIcon className="text-primary size-8" />
        <span>Shipping</span>
      </h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Where should we deliver?</CardTitle>
          </CardHeader>
          <CardContent>
            <ShippingForm
              isSubmitting={busy}
              onSubmit={(values) => {
                return checkout.mutate(values);
              }}
            />
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="space-y-2">
              {items.map((item) => {
                return (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span className="line-clamp-2">
                      {item.quantity} x {item.name}
                    </span>
                    <span className="tabular-nums">
                      {formatPrice(
                        item.priceCents * item.quantity,
                        item.currency,
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
            <hr />
            <div className="flex justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span className="tabular-nums">
                {formatPrice(
                  data?.cart.itemsPriceCents ?? 0,
                  items[0]?.currency ?? "usd",
                )}
              </span>
            </div>
            <Button
              type="submit"
              form="shipping-form"
              size="lg"
              className="w-full"
              disabled={busy}
            >
              {busy ? (
                <>
                  <Spinner />
                  <span>Opening secure payment...</span>
                </>
              ) : (
                <>
                  <LockIcon className="size-4" />{" "}
                  <span>Continue to payment</span>{" "}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;

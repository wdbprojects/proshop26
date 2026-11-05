"use client";

import ErrorCard from "@/components/shared/error-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAddresses } from "@/hooks/use-addresses";
import { useCartQuery } from "@/hooks/use-cart-query";
import { useCheckout } from "@/hooks/use-checkout";
import { formatPrice } from "@/lib/utils";
import EmptyCart from "@/modules/components/cart/empty-cart";
import SavedAddressPicker from "@/modules/components/checkout/saved-address-picker";
import ShippingForm from "@/modules/components/checkout/shipping-form";
import { toShippingPayload } from "@/schemas/address-schemas";
import { LockIcon, TruckIcon } from "lucide-react";
import { useState } from "react";

const CheckoutPage = () => {
  const { data, isLoading, isError } = useCartQuery();
  const { data: addressData, isLoading: loadingAddresses } = useAddresses();
  const checkout = useCheckout();
  // null = the customer hasn't chosen yet, so we fall back to the default address
  const [choice, setChoice] = useState<string | null>(null);

  if (isLoading || loadingAddresses) {
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

  const saved = addressData?.addresses ?? [];
  const maxAddresses = addressData?.maxAddresses ?? 4;
  // the list arrives default first
  const validChoice =
    choice !== null &&
    (choice === "new" ||
      saved.some((address) => {
        return address.id === choice;
      }));
  const selectedId = validChoice ? choice : (saved[0]?.id ?? "new");
  const selectedAddress = saved.find((address) => {
    return address.id === selectedId;
  });

  // after success the browser is navigatin to Polar - keep the button locked until it leaves
  const busy = checkout.isPending || checkout.isSuccess;

  const submitProps = selectedAddress
    ? {
        type: "button" as const,
        onClick: () =>
          checkout.mutate({
            address: toShippingPayload(selectedAddress),
            save: false,
          }),
      }
    : { type: "submit" as const, form: "shipping-form" };

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-foreground flex items-center gap-2 text-3xl font-semibold">
        <TruckIcon className="text-primary size-8" />
        <span>Shipping</span>
      </h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Where should we deliver?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {saved.length > 0 && (
              <SavedAddressPicker
                addresses={saved}
                selectedId={selectedId}
                onSelect={setChoice}
              />
            )}
            {!selectedAddress && (
              <ShippingForm
                canSave={saved.length < maxAddresses}
                onSubmit={(values, save) => {
                  return checkout.mutate({
                    address: toShippingPayload(values),
                    save: save,
                  });
                }}
              />
            )}
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
              size="lg"
              className="w-full"
              disabled={busy}
              {...submitProps}
            >
              {busy ? (
                <>
                  <Spinner />
                  <span>Opening secure payment...</span>
                </>
              ) : (
                <>
                  <LockIcon className="size-4" />
                  <span>Continue to payment</span>
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

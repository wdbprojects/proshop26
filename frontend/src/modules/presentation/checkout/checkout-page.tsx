"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartQuery } from "@/hooks/use-cart-query";
import { useAddresses } from "@/hooks/use-addresses";
import { useCheckoutMethods } from "@/hooks/use-checkout-method";
import { useCheckout, useQrCheckout } from "@/hooks/use-checkout";
import { PaymentMethod } from "@/config/type-schemas";

import Link from "next/link";
import { routes } from "@/config/routes";
import ErrorCard from "@/components/shared/error-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import EmptyCart from "@/modules/components/cart/empty-cart";
import SavedAddressPicker from "@/modules/components/checkout/saved-address-picker";
import ShippingForm from "@/modules/components/checkout/shipping-form";
import {
  ShippingAddressValues,
  toShippingPayload,
} from "@/schemas/address-schemas";
import { LockIcon, QrCodeIcon, TruckIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import QrPayment from "@/modules/components/checkout/qr-payment";
import PaymentMethodPicker from "@/modules/components/checkout/payment-method-picker";

const CheckoutPage = () => {
  const router = useRouter();
  const qrId = useSearchParams().get("qr");
  const { data, isLoading, isError } = useCartQuery();
  const { data: addressData, isLoading: loadingAddresses } = useAddresses();
  const { data: methods, isLoading: loadingMethods } = useCheckoutMethods();
  const cardCheckout = useCheckout();
  const qrCheckout = useQrCheckout();
  // null = the customer hasn't chosen yet, so we fall back to the default
  const [choice, setChoice] = useState<string | null>(null);
  const [methodChoice, setMethodChoice] = useState<PaymentMethod | null>(null);

  // once a QR exists, this page is just the QR screen (the cart empties when it is paid)
  if (qrId) {
    return (
      <div className="p-4">
        <QrPayment
          qrId={qrId}
          onRestart={() => router.replace(routes.checkout)}
        />
      </div>
    );
  }

  if (isLoading || loadingAddresses || loadingMethods) {
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

  const available: PaymentMethod[] = [];
  if (methods?.qr) available.push("qr");
  if (methods?.card) available.push("card");
  const method =
    methodChoice && available.includes(methodChoice)
      ? methodChoice
      : (available[0] ?? null);

  // after a card checkout succeeds the browser is navigating to Polar: keep the button locked until it leaves
  const busy =
    qrCheckout.isPending || cardCheckout.isPending || cardCheckout.isSuccess;

  const startPayment = (address: ShippingAddressValues, save: boolean) => {
    if (method === "qr") {
      qrCheckout.mutate(
        { address, save },
        {
          onSuccess: (qr) => {
            router.replace(`${routes.checkout}?qr=${qr.qrId}`);
          },
        },
      );
    } else if (method === "card") {
      cardCheckout.mutate({ address, save });
    }
  };

  const submitProps = selectedAddress
    ? {
        type: "button" as const,
        onClick: () => startPayment(toShippingPayload(selectedAddress), false),
      }
    : { type: "submit" as const, form: "shipping-form" };

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-foreground flex items-center gap-2 text-3xl font-semibold">
        <TruckIcon className="text-primary size-8" />
        <span>Checkout</span>
      </h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Where should we deliver?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {saved.length > 0 && (
                <>
                  <SavedAddressPicker
                    addresses={saved}
                    selectedId={selectedId}
                    onSelect={setChoice}
                  />
                </>
              )}
              {!selectedAddress && (
                <ShippingForm
                  canSave={saved.length < maxAddresses}
                  onSubmit={(values, save) => {
                    return startPayment(toShippingPayload(values), save);
                  }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment method</CardTitle>
            </CardHeader>
            <CardContent>
              {method && methods ? (
                <PaymentMethodPicker
                  methods={methods}
                  selected={method}
                  onSelect={setMethodChoice}
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Payments are temporarily unavailable. Please try again later.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

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
                  items[0]?.currency,
                )}
              </span>
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={busy || !method}
              {...submitProps}
            >
              {busy ? (
                <>
                  <Spinner />
                  <span>
                    {method === "qr"
                      ? "Generating QR..."
                      : "Opening secure payment..."}
                  </span>
                </>
              ) : method === "qr" ? (
                <>
                  <QrCodeIcon className="size-4" />
                  <span>Generate QR pay</span>
                </>
              ) : (
                <>
                  <LockIcon className="size-4" />
                  <span>Continue to card payment</span>
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

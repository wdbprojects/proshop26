"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const CheckoutReturnPage = () => {
  const params = useSearchParams();
  const checkoutId = params.get("checkout_id");

  const queryClient = useQueryClient();

  const clearCart = useCart((state) => {
    return state.clearCart;
  });

  useEffect(() => {
    clearCart();
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  }, [queryClient, clearCart]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="mx-auto max-w-lg min-w-sm px-0 py-6">
        <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex h-13 w-13 items-center justify-center rounded-full bg-lime-700/30">
            <CheckCircle2Icon className="size-9 text-lime-300/90" aria-hidden />
          </div>
          <h1 className="text-foreground text-2xl font-bold">
            Thanks for your order
          </h1>
          <p className="text-muted-foreground leading-normal">
            Your order is created after payment is confirmed. Open it from your
            orders list for{" "}
            <strong className="text-foreground">support chat</strong> (it
            appears there as <strong className="text-foreground">paid</strong>).
            We&apos;ll send video invites in that thread when needed.
          </p>
          {checkoutId ? (
            <p className="text-muted-foreground/50 mt-2 font-mono text-xs">
              Checkout: {checkoutId}
            </p>
          ) : null}
          <Link
            href={routes.orders}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "mt-2",
            )}
          >
            View Orders
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutReturnPage;

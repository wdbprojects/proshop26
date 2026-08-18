"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { useOrderDetails } from "@/hooks/use-order-details";
import { cn, formatOrderWhen, formatPrice } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

const OrderDetailsTop = ({ orderId }: { orderId: string }) => {
  const { order, items, paid, isLoading, error } = useOrderDetails(orderId);

  // handle loading and error states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading order...</div>;
  if (!order?.singleOrder) return <div>Order not found...</div>;

  const { singleOrder } = order;

  return (
    <div>
      <Link
        href={routes.orders}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "flex max-w-fit items-center justify-center gap-2",
        )}
      >
        <ArrowLeftIcon className="size-4" />
        <span>Back to orders</span>
      </Link>
      {/* FIRST PART - ORDER INFO */}
      <Card className="mt-4 gap-0 overflow-hidden p-0">
        <div className="from-primary/12 via-background to-card bg-linear-to-br px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-primary text-xs font-semibold tracking-wider uppercase">
                Order details
              </p>
              <h1 className="text-foreground mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                # {singleOrder.id?.slice(0, 8) || "N/A"}
              </h1>
              <p className="text-foreground/70 mt-1 text-sm">
                {singleOrder.createdAt
                  ? formatOrderWhen(singleOrder.createdAt, {
                      dateStyle: "full",
                    })
                  : "Date unavailable"}
              </p>
              <p className="text-foreground/45 mt-1 text-sm">
                {singleOrder.id}
              </p>
            </div>
            <div className="border-card/40 flex flex-col gap-3 border-t pt-4 lg:border-t-0 lg:pt-0 lg:text-right">
              <Badge
                className={cn(
                  "w-fit px-6 py-3 capitalize lg:ml-auto",
                  order.singleOrder.status === "paid"
                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : order.singleOrder.status === "pending"
                      ? "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                      : order.singleOrder.status === "failed"
                        ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                        : "",
                )}
                variant="outline"
              >
                {order?.singleOrder?.status}
              </Badge>
              <div>
                <p className="text-foreground/50 text-xs font-medium tracking-wide uppercase">
                  Order total
                </p>
                <p className="text-foreground text-xl font-semibold tabular-nums sm:text-2xl">
                  {formatPrice(singleOrder.totalCents, "usd")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-muted bg-background/5 border-t px-5 py-2">
          <p className="text-foreground/80 text-sm leading-relaxed">
            Need help with shipping or returns? Open the{" "}
            <strong className="text-foreground">Support chat</strong> tab after
            payment.
          </p>
          <p>
            Video call links are shared in that thread; everyone joins with the
            same link.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetailsTop;

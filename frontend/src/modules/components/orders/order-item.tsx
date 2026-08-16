"use client";

import { Card } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { IOrder } from "@/config/types";
import Link from "next/link";
import OrderPreview from "@/modules/components/orders/order-preview";
import { Badge } from "@/components/ui/badge";
import { formatOrderWhen, formatPrice } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";

const OrderItem = ({ order, summary }: { order: IOrder; summary: string }) => {
  const paymentStatus =
    order.status === "paid"
      ? "default"
      : order.status === "pending"
        ? "secondary"
        : order.status === "failed"
          ? "destructive"
          : "outline";

  return (
    <li>
      <Card className="group hover:border-primary/45 border border-transparent p-0 transition hover:shadow-md">
        <Link
          href={routes.orderItem(order.id)}
          className="h-full w-full rounded-md p-2"
        >
          <div className="flex flex-row flex-wrap items-center gap-4 py-1 sm:gap-5">
            <OrderPreview previewItems={order.previewItems} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground font-mono text-xs sm:text-sm">
                  {order.id.slice(0, 8)}
                </span>
                <Badge variant={paymentStatus} className="capitalize">
                  {order.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {formatOrderWhen(order.createdAt)}
              </p>
              <p className="text-muted-foreground/40 mt-1 text-sm font-medium">
                {summary}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="text-right">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Total
                </p>
                <p className="text-foreground text-lg font-bold tabular-nums sm:text-xl">
                  {formatPrice(order.totalCents, "usd")}
                </p>
              </div>
              <ChevronRightIcon
                className="text-muted-foreground group-hover:text-primary size-5 shrink-0 transition group-hover:translate-x-0.5"
                aria-hidden
              />
            </div>
          </div>
        </Link>
      </Card>
    </li>
  );
};

export default OrderItem;

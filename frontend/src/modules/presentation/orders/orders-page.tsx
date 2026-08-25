"use client";

import ErrorCard from "@/components/shared/error-card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { IOrder } from "@/config/types";
import { useOrdersPage } from "@/hooks/use-orders-page";
import { cn } from "@/lib/utils";
import OrderItem from "@/modules/components/orders/order-item";
import OrdersListSkeleton from "@/modules/components/orders/orders-list-skeleton";
import { PackageIcon } from "lucide-react";
import Link from "next/link";

const OrdersPage = ({ sessionDataError }: { sessionDataError: string }) => {
  const { isLoading, error, orders, staff } = useOrdersPage();

  if (isLoading) {
    return (
      <div className="p-4 text-left">
        <Skeleton className="mb-2 h-10 w-64 max-w-full" />
        <Skeleton className="mb-8 h-4 w-96 max-w-full" />
        <OrdersListSkeleton />
      </div>
    );
  }

  alert(sessionDataError);

  if (error) {
    return <ErrorCard />;
  }

  return (
    <div className="p-4 text-left">
      <h1 className="text-foreground mb-1 flex items-center gap-2 text-3xl font-bold">
        <PackageIcon className="text-primary size-8" />
        {staff ? "Orders" : "Your orders"}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {staff
          ? "All store orders. Open one for customer support chat."
          : "Paid orders include customer support: open an order for chat."}
      </p>
      {orders.length === 0 ? (
        <p className="text-muted-foreground mt-4">
          No orders yet.{" "}
          <Link
            href={routes.home}
            className={cn(buttonVariants({ size: "sm", variant: "link" }))}
          >
            Browse the shop
          </Link>
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {orders.map((order: IOrder) => {
            const previewItems = order.previewItems ?? [];
            const totalUnits = previewItems.reduce((sum, row) => {
              return sum + row.quantity;
            }, 0);
            const lineCount = previewItems.length;
            const summary =
              lineCount === 0
                ? "No line items"
                : lineCount === 1
                  ? `${totalUnits} ${totalUnits === 1 ? "item" : "items"}`
                  : `${lineCount} products · ${totalUnits} items`;
            return <OrderItem order={order} key={order.id} summary={summary} />;
          })}
        </ul>
      )}
    </div>
  );
};

export default OrdersPage;

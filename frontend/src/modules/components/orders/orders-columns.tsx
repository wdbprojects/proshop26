"use client";

import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { IManagedOrder, PaymentStatus } from "@/config/type-schemas";
import { formatOrderWhen, formatPrice } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import FulfillmentBadge from "./fulfillment-badge";

const paymentVariant = (status: PaymentStatus) => {
  return status === "paid"
    ? "default"
    : status === "pending"
      ? "secondary"
      : "destructive";
};

export const orderColumns: ColumnDef<IManagedOrder>[] = [
  {
    accessorKey: "id",
    header: "Order",
    cell: ({ row }) => {
      return (
        <Link
          href={routes.orderItem(row.original.id)}
          className="font-mono text-xs hover:underline"
        >
          {row.original.id.slice(0, 8)}
        </Link>
      );
    },
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => {
      return (
        <div>
          <div className="font-medium">
            {row.original.shipFullName ?? row.original.customerName}
          </div>
          <div className="text-muted-foreground text-xs">
            {row.original.customerEmail}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "shipCity",
    header: "City",
    cell: ({ row }) => {
      return row.original.shipCity ?? "-";
    },
  },
  {
    accessorKey: "totalCents",
    header: () => {
      return <div className="text-right">Total</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium tabular-nums">
          {formatPrice(row.original.totalCents, row.original.currency)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Payment",
    cell: ({ row }) => {
      return (
        <Badge
          className="capitalize"
          variant={paymentVariant(row.original.status)}
        >
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "fulfillmentStatus",
    header: "Fulfillment",
    cell: ({ row }) => {
      return row.original.status === "paid" ? (
        <FulfillmentBadge status={row.original.fulfillmentStatus} />
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground text-xs">
          {formatOrderWhen(row.original.createdAt)}
        </span>
      );
    },
  },
  {
    id: "open",
    header: "",
    cell: ({ row }) => {
      <Link
        href={routes.orderItem(row.original.id)}
        className="text-primary text-sm underline-offset-4 hover:underline"
      >
        Open
      </Link>;
    },
  },
];

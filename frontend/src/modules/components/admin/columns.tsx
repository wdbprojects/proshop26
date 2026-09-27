"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import { Package2Icon } from "lucide-react";
import Image from "next/image";

import EditAction from "@/modules/components/admin/edit-action";
import DeleteAction from "@/modules/components/admin/delete-action";
import { IK_PRESETS, imageKitOptimizedUrl } from "@/lib/image-kit-url";
import { formatPrice } from "@/lib/utils";
import { ProductType } from "@/config/type-schemas";

export type Product = {
  id: string;
  name: string;
  category: string;
  slug: string;
  priceCents: number;
  currency: string;
  active: "yes" | "no";
};

export const columns: ColumnDef<ProductType>[] = [
  {
    accessorKey: "imageUrl",
    header: "Preview",
    cell: ({ row }) => {
      const url: string = row.getValue("imageUrl");
      return (
        <div className="border-muted bg-background/30 ring-muted/50 relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border shadow-sm ring-1 sm:h-18 sm:w-18">
          {url ? (
            <Image
              src={imageKitOptimizedUrl(url, IK_PRESETS.adminThumb)}
              width={300}
              height={300}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="from-muted/90 to-muted/50 flex h-full w-full items-center justify-center bg-linear-to-br">
              <Package2Icon className="text-foreground/50 size-6" aria-hidden />
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: () => {
      return <div className="text-center">Category</div>;
    },
    cell: ({ row }) => {
      const category: string = row.getValue("category");
      return (
        <div className="flex w-full items-center justify-center">
          <Badge variant="outline" className="rounded-lg p-3 text-xs">
            {category}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const category: string = row.getValue("description");
      return (
        <div className="w-full text-wrap">{category.slice(0, 100) + ""}</div>
      );
    },
  },
  {
    accessorKey: "active",
    header: () => {
      return <div className="text-center">Active</div>;
    },
    cell: ({ row }) => {
      const active: boolean = row.getValue("active");
      return (
        <div className="flex w-full items-center justify-center">
          <Badge
            variant={active === true ? "default" : "destructive"}
            className="rounded-lg p-3 text-xs"
          >
            {active === true ? "Yes" : "No"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "priceCents",
    header: () => {
      return <div className="text-right">Amount</div>;
    },
    cell: ({ row }) => {
      const amount: number = parseFloat(row.getValue("priceCents"));
      const currency: string = row.original.currency;
      // const formattedAmount = new Intl.NumberFormat("en-US", {
      //   style: "currency",
      //   currency: "USD",
      // }).format(amount);
      return (
        <div className="text-right font-medium">
          {formatPrice(amount, currency)}
        </div>
      );
    },
  },

  {
    id: "editAction",
    header: "",
    size: 20,
    cell: ({ row }) => {
      return (
        <div className="flex w-auto min-w-12.5 justify-end">
          <EditAction product={row?.original} />
        </div>
      );
    },
  },
  {
    id: "deleteAction",
    header: "",
    size: 20,
    cell: ({ row }) => {
      return (
        <div className="flex w-auto justify-start">
          <DeleteAction product={row?.original} />
        </div>
      );
    },
  },
];

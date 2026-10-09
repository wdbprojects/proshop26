"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import { Package2Icon } from "lucide-react";
import Image from "next/image";

import EditAction from "@/modules/components/admin/edit-action";
import DeleteAction from "@/modules/components/admin/delete-action";
import { IK_PRESETS, imageKitOptimizedUrl } from "@/lib/image-kit-url";
import { formatPriceNew } from "@/lib/utils";
import { ProductType } from "@/config/type-schemas";

export const columns: ColumnDef<ProductType>[] = [
  {
    id: "thumbnail",
    accessorFn: (row) => {
      return (
        row.images?.find((img) => {
          return img.isPrimary;
        })?.url ??
        row.images?.[0]?.url ??
        null
      );
    },
    header: "Preview",
    cell: ({ getValue }) => {
      const url = getValue<string | null>();
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
    id: "category",
    accessorFn: (row) => {
      return row.category?.name ?? "Uncategorized";
    },
    header: () => {
      return <div className="text-center">Category</div>;
    },
    cell: ({ getValue }) => {
      const categoryName = getValue<string>();
      return (
        <div className="flex w-full items-center justify-center">
          <Badge variant="outline" className="rounded-lg p-3 text-xs">
            {categoryName}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  /* {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const category: string = row.getValue("description") ?? "";
      return (
        <div className="w-full text-wrap">{category.slice(0, 100) + ""}</div>
      );
    },
  }, */
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
      const amount: number = row.getValue("priceCents");
      const currency: string = row.original.currency;
      return (
        <div className="text-right font-medium">
          {formatPriceNew(amount, currency)}
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

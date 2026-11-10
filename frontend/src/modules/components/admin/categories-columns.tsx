"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IAdminCategory } from "@/config/type-schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon } from "lucide-react";

type CategoryActions = {
  onEdit: (category: IAdminCategory) => void;
  onToggle: (category: IAdminCategory) => void;
  onDelete: (category: IAdminCategory) => void;
  busy: boolean;
};

export const getCategoryColumns = ({
  onEdit,
  onToggle,
  onDelete,
  busy,
}: CategoryActions): ColumnDef<IAdminCategory>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && (
            <div className="text-muted-foreground max-w-xs truncate text-xs">
              {row.original.description}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => {
      return <span className="font-mono text-xs">{row.original.slug}</span>;
    },
  },
  {
    accessorKey: "displayOrder",
    header: "Order",
  },
  { accessorKey: "productCount", header: "Products" },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => {
      <Badge variant={row.original.active ? "default" : "secondary"}>
        {row.original.active ? "Active" : "Inactive"}
      </Badge>;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(category)}>
            <PencilIcon className="size-3.5" />
            <span>Edit</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onToggle(category)}
          >
            {category.active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={category.productCount > 0}
            onClick={() => onDelete(category)}
            title={
              category.productCount > 0
                ? "Has products: deactivate it instead"
                : "Delete category"
            }
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      );
    },
  },
];

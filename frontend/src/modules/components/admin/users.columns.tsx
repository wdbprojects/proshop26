"use client";

import { Badge } from "@/components/ui/badge";
import { IAdminUser } from "@/config/type-schemas";
import { formatOrderWhen } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import UserActions from "@/modules/components/admin/user-actions";

export const userColumns: ColumnDef<IAdminUser>[] = [
  {
    id: "user",
    header: "User",
    cell: ({ row }) => (
      <div>
        <div className="flex items-center gap-2 font-medium">
          <span>{row.original.name}</span>
          {!row.original.emailVerified && (
            <Badge variant="outline" className="text-[10px]">
              Unverified
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground text-xs">
          {row.original.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      return (
        <Badge
          variant={row.original.role === "admin" ? "default" : "secondary"}
          className="capitalize"
        >
          {row.original.role}
        </Badge>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      return row.original.banned ? (
        <Badge variant="destructive" title={row.original.banReason ?? ""}>
          Banned
        </Badge>
      ) : (
        <span className="text-muted-foreground text-xs">Active</span>
      );
    },
  },
  { accessorKey: "orderCount", header: "Orders" },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground text-xs">
          {formatOrderWhen(row.original.createdAt)}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return <UserActions user={row.original} />;
    },
  },
];

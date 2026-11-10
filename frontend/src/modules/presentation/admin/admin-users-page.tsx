"use client";

import { useState } from "react";
import { USER_ROLES } from "@/config/data";
import { useDebounce } from "@/hooks/use-debounce";
import { AdminUsersFilters, useAdminUsers } from "@/hooks/use-admin-users";
import { UserRole } from "@/config/type-schemas";
import ErrorCard from "@/components/shared/error-card";
import { SearchIcon, UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/modules/components/admin/products-table";
import { userColumns } from "@/modules/components/admin/users.columns";
import { Skeleton } from "@/components/ui/skeleton";

const ROLE_OPTIONS = [{ value: "all", label: "All roles" }, ...USER_ROLES];
const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
];

const AdminUsersPage = () => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim(), 300);

  const filters: AdminUsersFilters = {
    page: page,
    q: debouncedSearch,
    role: role === "all" ? undefined : (role as UserRole),
    status: status === "all" ? undefined : (status as "active" | "banned"),
  };
  const { data, isLoading, isError } = useAdminUsers(filters);

  if (isError) return <ErrorCard />;

  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <UsersIcon className="text-primary size-7" />
        <span>Users</span>
        {data && (
          <span className="text-muted-foreground text-sm font-normal">
            ({data.pagination.total})
          </span>
        )}
      </h1>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search name or email..."
            className="pl-8"
          />
        </div>

        <Select
          value={role}
          onValueChange={(value) => {
            setRole(String(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue>
              {
                ROLE_OPTIONS.find((option) => {
                  return option.value === role;
                })?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((option) => {
              return (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(String(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue>
              {
                STATUS_OPTIONS.find((option) => {
                  return option.value === status;
                })?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => {
              return (
                <SelectItem key={option.value} value={option.value}>
                  {option.value}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((item) => {
            return <Skeleton key={item} className="h-12 w-full" />;
          })}
        </div>
      ) : (
        <DataTable
          columns={userColumns}
          data={data?.users ?? []}
          pagination={{
            page: page,
            totalPages: data?.pagination.totalPages ?? 1,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;

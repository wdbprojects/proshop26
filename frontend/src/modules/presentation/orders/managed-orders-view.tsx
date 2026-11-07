"use client";

import ErrorCard from "@/components/shared/error-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FulfillmentStatus, PaymentStatus } from "@/config/type-schemas";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ManagedOrdersFiltes,
  useManagedOrders,
  useOrdersSummary,
} from "@/hooks/use-managed-orders";
import { FULFILLMENT_LABELS } from "@/lib/order-status";
import { DataTable } from "@/modules/components/admin/products-table";
import { orderColumns } from "@/modules/components/orders/orders-columns";
import { PackageIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

const PAYMENT_OPTIONS = [
  { value: "all", label: "All payments" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const FULFILLMENT_OPTIONS = [
  { value: "all", label: "All fulfillment" },
  ...Object.entries(FULFILLMENT_LABELS).map(([value, label]) => {
    return { value, label };
  }),
];

const ManagedOrdersView = () => {
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("all");
  const [fulfillment, setFulfillment] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim(), 300);

  const filters: ManagedOrdersFiltes = {
    page: page,
    q: debouncedSearch,
    payment: payment === "all" ? undefined : (payment as PaymentStatus),
    fulfillment:
      fulfillment === "all" ? undefined : (fulfillment as FulfillmentStatus),
  };

  const { data, isLoading, isError } = useManagedOrders(filters);
  const { data: summary } = useOrdersSummary(true);

  const showQueue = (status: FulfillmentStatus) => {
    setPayment("paid");
    setFulfillment(status);
    setPage(1);
  };

  if (isError) return <ErrorCard />;

  const rows = data?.orders ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <PackageIcon className="text-primary size-7" />
          <span>Orders</span>
        </h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => showQueue("unfulfilled")}
          >
            To ship ({summary?.unfulfilled ?? 0})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => showQueue("processing")}
          >
            Processing ({summary?.processing ?? 0})
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search order id, customer, email or phone..."
            className="pl-8"
          />
        </div>
        <Select
          value={payment}
          onValueChange={(value) => {
            setPayment(String(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue>
              {
                PAYMENT_OPTIONS.find((option) => {
                  return option.value === payment;
                })?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_OPTIONS.map((option) => {
              return (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          value={fulfillment}
          onValueChange={(value) => {
            setFulfillment(String(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue>
              {
                FULFILLMENT_OPTIONS.find((option) => {
                  return option.value === fulfillment;
                })?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FULFILLMENT_OPTIONS.map((option) => {
              return (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
          columns={orderColumns}
          data={rows}
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

export default ManagedOrdersView;

"use client";

import { useState } from "react";
import { useAddresses } from "@/hooks/use-addresses";
import { IAddress } from "@/config/type-schemas";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorCard from "@/components/shared/error-card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AddressCard from "@/modules/components/address/address-card";
import AddressDialog from "@/modules/components/address/address-dialog";

const AddressesPage = () => {
  const { data, isLoading, isError } = useAddresses();
  const [dialog, setDialog] = useState<{ open: boolean; address?: IAddress }>({
    open: false,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorCard />;
  }

  const list = data.addresses;
  const atLimit = list.length >= data.maxAddresses;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My addresses</h1>
          <p className="text-muted-foreground text-sm">
            {list.length} of {data.maxAddresses} saved
          </p>
        </div>
        <Button disabled={atLimit} onClick={() => setDialog({ open: true })}>
          <PlusIcon className="size-4" />
          <span>Add address</span>
        </Button>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center"></CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((address) => {
            return (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => {
                  setDialog({ open: true, address: address });
                }}
              />
            );
          })}
        </div>
      )}

      <AddressDialog
        open={dialog.open}
        address={dialog.address}
        isFirst={list.length === 0}
        onOpenChange={(open) => {
          setDialog((prev) => {
            return { ...prev, open: open };
          });
        }}
      />
    </div>
  );
};

export default AddressesPage;

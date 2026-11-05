"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IAddress } from "@/config/type-schemas";
import AddressForm from "@/modules/components/address/address-form";

const AddressDialog = ({
  open,
  onOpenChange,
  address,
  isFirst,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: IAddress;
  isFirst: boolean;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{address ? "Edit address" : "New address"}</DialogTitle>
          <DialogDescription>
            Saved addresses are copied to your orders, so editing one leter
            never changes an order you already placed.{" "}
          </DialogDescription>
        </DialogHeader>
        <AddressForm
          address={address}
          isFirst={isFirst}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;

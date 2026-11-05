"use client";

import { useAddressActions } from "@/hooks/use-addresses";
import { IAddress } from "@/config/type-schemas";
import { cn } from "cn";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddressSummary from "@/modules/components/address/address-summary";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AddressCard = ({
  address,
  onEdit,
}: {
  address: IAddress;
  onEdit: () => void;
}) => {
  const { setDefault, remove } = useAddressActions();
  const busy = setDefault.isPending || remove.isPending;

  return (
    <Card className={cn(address.isDefault && "ring-primary/40 ring-2")}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="truncate">{address.label || address.fullName}</span>
          {address.isDefault && <Badge>Default</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AddressSummary address={address} />
      </CardContent>
      <CardFooter className="mt-auto flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>
          <PencilIcon className="size-3.5" />
          <span>Edit</span>
        </Button>
        {!address.isDefault && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => setDefault.mutate(address.id)}
          >
            Set as default
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button size="sm" variant="destructive" disabled={busy} />}
          >
            <Trash2Icon className="size-3.5" />
            <span>Delete</span>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this address?</AlertDialogTitle>
              <AlertDialogDescription>
                Orders you already placed their delivery address
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => remove.mutate(address.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default AddressCard;

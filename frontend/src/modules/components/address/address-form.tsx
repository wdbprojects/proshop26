"use client";

import {
  Field,
  FieldGroup,
  FieldTitle,
  FieldDescription,
} from "@/components/ui/field";
import { IAddress } from "@/config/type-schemas";
import { useAddressActions } from "@/hooks/use-addresses";
import {
  addressFormSchema,
  AddressFormValues,
  emptyAddress,
  toFormValues,
} from "@/schemas/address-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import AddressFields, { TextField } from "./address-fields";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const AddressForm = ({
  address,
  isFirst,
  onDone,
}: {
  address?: IAddress;
  isFirst: boolean;
  onDone: () => void;
}) => {
  const { create, update } = useAddressActions();
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: address
      ? toFormValues(address)
      : { ...emptyAddress, isDefault: isFirst },
  });
  const { control, handleSubmit } = form;
  const pending = create.isPending || update.isPending;

  const onSubmit = (values: AddressFormValues) => {
    if (address) {
      update.mutate({ id: address.id, values }, { onSuccess: onDone });
    } else {
      create.mutate(values, { onSuccess: onDone });
    }
  };

  // the current default can't be switched off (promote another on instead), and the first address is always the default
  const lockDefault = Boolean(address?.isDefault) || isFirst;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <TextField
          control={control}
          name="label"
          label="Label (optional)"
          placeholder="Home, Work, Mom's house"
        />
        <AddressFields form={form} />
        <Controller
          control={control}
          name="isDefault"
          render={({ field }) => {
            return (
              <Field
                orientation="horizontal"
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <FieldTitle>Default address</FieldTitle>
                  <FieldDescription>
                    Selected first at checkout
                  </FieldDescription>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={lockDefault}
                />
              </Field>
            );
          }}
        />
      </FieldGroup>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          <span>{address ? "Save changes" : "Save address"}</span>
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;

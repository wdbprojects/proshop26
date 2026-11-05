"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldGroup } from "@/components/ui/field";

import {
  addressFormSchema,
  AddressFormValues,
  emptyAddress,
} from "@/schemas/address-schemas";
import AddressFields from "../address/address-fields";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";

const ShippingForm = ({
  onSubmit,
  canSave,
}: {
  onSubmit: (values: AddressFormValues, save: boolean) => void;
  canSave: boolean;
}) => {
  const [save, setSave] = useState(true);
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: emptyAddress,
  });

  const { handleSubmit } = form;

  return (
    <form
      id="shipping-form"
      onSubmit={handleSubmit((values) => {
        return onSubmit(values, canSave && save);
      })}
    >
      <FieldGroup className="gap-4">
        <AddressFields form={form} />
        {canSave && (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={save}
              onCheckedChange={(checked) => {
                setSave(checked === true);
              }}
            />
            <span>Save this address for next time</span>
          </label>
        )}
      </FieldGroup>
    </form>
  );
};

export default ShippingForm;

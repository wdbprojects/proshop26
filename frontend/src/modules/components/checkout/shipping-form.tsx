"use client";

import { useState } from "react";
import {
  shippingAddressSchema,
  ShippingAddressValues,
} from "@/schemas/checkout-schemas";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import ShippingTextField from "@/modules/components/checkout/shipping-text-field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2Icon, LocateFixedIcon, XIcon } from "lucide-react";

const round6 = (value: number) => {
  return Math.round(value * 1_000_000) / 1_000_000;
};

const ShippingForm = ({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (values: ShippingAddressValues) => void;
  isSubmitting: boolean;
}) => {
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const location = useCurrentLocation();

  const form = useForm<ShippingAddressValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      city: "",
      zone: "",
      street: "",
      reference: "",
      latitude: null,
      longitude: null,
    },
  });

  const { control, handleSubmit, setValue, trigger, watch } = form;

  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const hasLocation = latitude !== null && longitude !== null;

  const handleLocate = () => {
    location.request((coords) => {
      setValue("latitude", round6(coords.latitude), { shouldDirty: true });
      setValue("longitude", round6(coords.longitude), { shouldDirty: true });
      setAccuracy(Math.round(coords.accuracy));
      // the "share location or describe" error lives on `reference`, so re-check it
      void trigger("reference");
    });
  };

  const clearLocation = () => {
    setValue("latitude", null, { shouldDirty: true });
    setValue("longitude", null, { shouldDirty: true });
    setAccuracy(null);
  };

  return (
    <form id="shipping-form" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <ShippingTextField
          control={control}
          name="fullName"
          label="Full name"
          placeholder="Your name here..."
          autoComplete="name"
        />
        <ShippingTextField
          control={control}
          name="phone"
          label="Phone (the courier may call you)"
          placeholder="+591 7xxxxxxx"
          type="tel"
          autoComplete="tel"
        />
        <ShippingTextField
          control={control}
          name="city"
          label="City / department"
          placeholder="La Paz"
        />
        <ShippingTextField
          control={control}
          name="zone"
          label="Zone / neighborhood (optional)"
          placeholder="Sopocachi"
        />
        <ShippingTextField
          control={control}
          name="street"
          label="Street and number (optional)"
        />

        {/* LOCATION */}
        <Field className="gap-2">
          <FieldLabel>Delivery location</FieldLabel>
          {hasLocation ? (
            <div className="bg-muted flex flex-wrap items-center justify-between gap-2 rounded-2xl px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-green-600" />
                <span>
                  Location saved{" "}
                  {accuracy !== null && `(accurate to about ${accuracy} m)`}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={handleLocate}
                  disabled={location.loading}
                >
                  Update
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={clearLocation}
                >
                  <XIcon className="size-3" />
                  <span>Remove</span>
                </Button>
              </span>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleLocate}
              disabled={location.loading}
            >
              {location.loading ? <Spinner /> : <LocateFixedIcon />}
              <span>
                {location.loading
                  ? "Getting your location..."
                  : "Use my current location"}
              </span>
            </Button>
          )}
          {location.error && (
            <p className="text-destructive text-xs">{location.error}</p>
          )}
          <FieldDescription>
            Best on your phone, standing at the delivery spot. On a computer the
            location can be off by kilometers.{" "}
          </FieldDescription>
        </Field>

        <Controller
          control={control}
          name="reference"
          render={({ field, fieldState }) => {
            return (
              <Field className="gap-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="ship-reference">
                  How to find you
                </FieldLabel>
                <Textarea
                  id="id-reference"
                  rows={3}
                  placeholder="Blue door, next to the pharmacy, 2nd floor"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError
                  errors={[fieldState.error]}
                  className="text-xs italic"
                />
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
};

export default ShippingForm;

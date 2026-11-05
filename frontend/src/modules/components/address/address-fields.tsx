"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { DEPARTMENTS } from "@/config/departments";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { AddressFormValues } from "@/schemas/address-schemas";

import { CheckCircle2Icon, LocateFixedIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Control, Controller, UseFormReturn } from "react-hook-form";

type TextName = "label" | "fullName" | "phone" | "zone" | "street";

export const TextField = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
  autoComplete = "off",
}: {
  control: Control<AddressFormValues>;
  name: TextName;
  label: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <Field className="gap-2" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`addr-${name}`}>{label}</FieldLabel>
            <Input
              id={`addr-${name}`}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
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
  );
};

const round6 = (value: number) => {
  return Math.round(value * 1_000_000) / 1_000_000;
};

const AddressFields = ({
  form,
}: {
  form: UseFormReturn<AddressFormValues>;
}) => {
  const { control, setValue, trigger, watch } = form;
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const location = useCurrentLocation();

  const hasLocation = watch("latitude") !== null && watch("longitude") !== null;

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
    <>
      <TextField
        control={control}
        name="fullName"
        label="Full name"
        placeholder="Nick Nolte"
        autoComplete="name"
      />
      <TextField
        control={control}
        name="phone"
        label="Phone (the courier may call you)"
        placeholder="+591 7xxxxxxx"
        type="tel"
        autoComplete="tel"
      />
      <Controller
        control={control}
        name="city"
        render={({ field, fieldState }) => {
          return (
            <Field className="gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="addr-city">Department</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={(value) => {
                  return field.onChange(value ?? "");
                }}
              >
                <SelectTrigger
                  name="addr-city"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((department) => {
                    return (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FieldError
                errors={[fieldState.error]}
                className="text-xs italic"
              />
            </Field>
          );
        }}
      />
      <TextField
        control={control}
        name="zone"
        label="City, town or zone (optional)"
        placeholder="Sopocachi"
      />
      <TextField
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
                {accuracy !== null && ` (accurate to about ${accuracy} m)`}
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
          location can be off by kilometers
        </FieldDescription>
      </Field>

      <Controller
        control={control}
        name="reference"
        render={({ field, fieldState }) => {
          return (
            <Field className="gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="addr-reference">How to find you</FieldLabel>
              <Textarea
                id="addr-reference"
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
    </>
  );
};

export default AddressFields;

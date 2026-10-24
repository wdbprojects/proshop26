import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ShippingAddressValues } from "@/schemas/checkout-schemas";
import { Control, Controller } from "react-hook-form";

type TextName =
  | "fullName"
  | "phone"
  | "city"
  | "zone"
  | "street"
  | "postalCode";

const ShippingTextField = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
  autoComplete = "off",
}: {
  control: Control<ShippingAddressValues>;
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
            <FieldLabel htmlFor={`ship-${name}`}>{label}</FieldLabel>
            <Input
              id={`ship-${name}`}
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

export default ShippingTextField;

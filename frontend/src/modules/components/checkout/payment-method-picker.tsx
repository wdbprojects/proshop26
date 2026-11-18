"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckoutMethods, PaymentMethod } from "@/config/type-schemas";
import { cn } from "cn";
import { CreditCardIcon, QrCodeIcon } from "lucide-react";

const OPTIONS = [
  {
    value: "qr",
    title: "QR payment",
    description: "Pay from any Bolivian banking app. Confirmed automatically.",
    icon: QrCodeIcon,
  },
  {
    value: "card",
    title: "Credit or debit card",
    description: "Secure card payment.",
    icon: CreditCardIcon,
  },
] as const;

const PaymentMethodPicker = ({
  methods,
  selected,
  onSelect,
}: {
  methods: CheckoutMethods;
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}) => {
  const options = OPTIONS.filter((option) => {
    return methods[option.value];
  });

  return (
    <RadioGroup
      value={selected}
      onValueChange={(value) => onSelect(String(value) as PaymentMethod)}
    >
      {options.map((option) => {
        return (
          <div
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
              selected === option.value
                ? "border-primary bg-primary/5"
                : "hover:border-primary/40",
            )}
          >
            <RadioGroupItem value={option.value} className="mt-1" />
            <option.icon className="text-primary mt-0.5 size-5 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-medium">{option.title}</p>
              <p className="text-muted-foreground text-sm">
                {option.description}
              </p>
            </div>
          </div>
        );
      })}
    </RadioGroup>
  );
};

export default PaymentMethodPicker;

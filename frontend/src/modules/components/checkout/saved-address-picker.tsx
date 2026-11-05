"use client";

import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IAddress } from "@/config/type-schemas";
import { cn } from "cn";
import AddressSummary from "@/modules/components/address/address-summary";

const SavedAddressPicker = ({
  addresses,
  selectedId,
  onSelect,
}: {
  addresses: IAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
}) => {
  const card = (selected: boolean) => {
    return cn(
      "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
      selected ? "border-primary bg-primary/5" : "hover:border-primary/40",
    );
  };

  return (
    <RadioGroup
      value={selectedId}
      onValueChange={(value) => onSelect(String(value))}
    >
      {addresses.map((address) => {
        return (
          <div
            key={address.id}
            className={card(selectedId === address.id)}
            onClick={() => onSelect(address.id)}
          >
            <RadioGroupItem value={address.id} className="mt-1" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {address.label || "Saved address"}
                </span>
                {address.isDefault && (
                  <Badge variant="secondary">Default</Badge>
                )}
              </div>
              <AddressSummary address={address} />
            </div>
          </div>
        );
      })}
      <div
        className={card(selectedId === "new")}
        onClick={() => onSelect("new")}
      >
        <RadioGroupItem value="new" className="mt-1" />
        <span className="font-medium">Use a different address</span>
      </div>
    </RadioGroup>
  );
};

export default SavedAddressPicker;

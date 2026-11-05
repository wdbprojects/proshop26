import { IAddress } from "@/config/type-schemas";
import { MapPinIcon } from "lucide-react";

const AddressSummary = ({ address }: { address: IAddress }) => {
  const line = [address.street, address.zone, address.city]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="space-y-0.5 text-sm">
      <p className="text-foreground font-semibold">{address.fullName}</p>
      <p>{address.phone}</p>
      <p>{line}</p>
      {address.reference && (
        <p className="text-muted-foreground italic">
          &ldquo;{address.reference}&rdquo;
        </p>
      )}
      {address.latitude !== null && (
        <p className="text-muted-foreground flex items-center gap-1 text-xs">
          <MapPinIcon className="size-3" />
          <span>GPS location saved</span>
        </p>
      )}
    </div>
  );
};

export default AddressSummary;

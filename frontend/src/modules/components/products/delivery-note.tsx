import { DELIVERY_LONG, DELIVERY_TITLE } from "@/config/store";
import { MapPinIcon } from "lucide-react";
import React from "react";

const DeliveryNote = () => {
  return (
    <div className="border-muted/30 bg-muted/40 mt-2 flex gap-3 border px-3 py-3 text-sm">
      <MapPinIcon className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">{DELIVERY_TITLE}</p>
        <p className="font-muted-foreground">{DELIVERY_LONG}</p>
      </div>
    </div>
  );
};

export default DeliveryNote;

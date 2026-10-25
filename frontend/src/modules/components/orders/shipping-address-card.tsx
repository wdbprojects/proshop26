import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IOrder } from "@/config/type-schemas";
import { cn } from "cn";
import { MapPinIcon, NavigationIcon } from "lucide-react";

const ShippingAddressCard = ({
  order,
}: {
  order: Omit<IOrder, "previewItems">;
}) => {
  // orders created before addresses existed have none
  if (!order.shipFullName) return null;

  const hasLocation =
    order.shipLatitude !== null && order.shipLongitude !== null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${order.shipLatitude},${order.shipLongitude}`;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPinIcon className="text-primary size-5" />
          <span>Shipping address</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="text-foreground font-semibold">{order.shipFullName}</p>
        <p>{order.shipPhone}</p>
        <p>
          {[order.shipStreet, order.shipZone, order.shipCity]
            .filter(Boolean)
            .join(", ")}
        </p>
        {order.shipReference && (
          <p className="text-muted-foreground italic">
            &ldquo;{order.shipReference}&ldquo;
          </p>
        )}
        {hasLocation && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-2 flex w-fit items-center gap-2",
            )}
          >
            <NavigationIcon className="size-3.5" />
            <span>Open in Google Maps</span>
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingAddressCard;

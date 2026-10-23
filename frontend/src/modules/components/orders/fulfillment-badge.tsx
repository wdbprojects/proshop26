import { Badge } from "@/components/ui/badge";
import { FulfillmentStatus } from "@/config/type-schemas";
import { FULFILLMENT_LABELS } from "@/lib/order-status";
import { cn } from "cn";

const STYLES: Record<FulfillmentStatus, string> = {
  unfulfilled:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  processing: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  shipped:
    "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  delivered: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const FulfillmentBadge = ({
  status,
  className,
}: {
  status: FulfillmentStatus;
  className?: string;
}) => {
  return (
    <Badge variant="outline" className={cn(STYLES[status], className)}>
      {FULFILLMENT_LABELS[status]}
    </Badge>
  );
};

export default FulfillmentBadge;

"use client";

import { useState } from "react";
import { FulfillmentStatus } from "@/config/type-schemas";
import { useUpdateFulfillment } from "@/hooks/use-update-fulfillment";
import { FULFILLMENT_LABELS, FULFILLMENT_NEXT } from "@/lib/order-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

const FulfillmentControls = ({
  orderId,
  current,
}: {
  orderId: string;
  current: FulfillmentStatus;
}) => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const update = useUpdateFulfillment(orderId);
  const next = FULFILLMENT_NEXT[current];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">
          Fulfillment (staff only) - {FULFILLMENT_LABELS[current]}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        {next.length === 0 && (
          <p className="text-muted-foreground text-sm">
            This order is closed. No further actions.
          </p>
        )}
        {next.includes("processing") && (
          <Button
            disabled={update.isPending}
            onClick={() => update.mutate({ status: "processing" })}
          >
            Mark as processing
          </Button>
        )}
        {next.includes("shipped") && (
          <div className="flex items-center gap-2">
            <Input
              value={trackingNumber}
              onChange={(event) => {
                setTrackingNumber(event.target.value);
              }}
              placeholder="Tracking number (optional)"
              className="w-56"
            />
            <Button
              disabled={update.isPending}
              onClick={() => {
                const tracking = trackingNumber.trim();
                update.mutate({
                  status: "shipped",
                  trackingNumber: tracking === "" ? undefined : tracking,
                });
              }}
            >
              Mark as shipped
            </Button>
          </div>
        )}
        {next.includes("delivered") && (
          <Button
            disabled={update.isPending}
            onClick={() => update.mutate({ status: "delivered" })}
          >
            Mark as delivered
          </Button>
        )}
        {next.includes("cancelled") && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" disabled={update.isPending} />
              }
            >
              Cancel order
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  The products go back into stock. This does not refund the
                  customer. Issue the refund from the Polar dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep order</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => update.mutate({ status: "cancelled" })}
                >
                  Cancel order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {update.isPending && <Spinner />}
      </CardContent>
    </Card>
  );
};

export default FulfillmentControls;

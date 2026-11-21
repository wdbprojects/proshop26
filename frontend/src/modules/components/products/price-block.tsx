import { ONLINE_DISCOUNT_PERCENT } from "@/config/store";
import { onlinePriceCents } from "@/lib/pricing";
import { cn, formatPrice } from "@/lib/utils";
import React from "react";

const PriceBlock = ({
  listCents,
  currency,
  large = false,
  note = false,
  className,
}: {
  listCents: number;
  currency: string;
  large?: boolean;
  note?: boolean;
  className?: string;
}) => {
  const online = onlinePriceCents(listCents);
  const discounted = online < listCents;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span
          className={cn(
            "text-foreground font-bold tabular-nums",
            large ? "text-3xl md:text-4xl" : "text-lg",
          )}
        >
          {formatPrice(online, currency)}
        </span>
        {discounted && (
          <span
            title="Price when ordering by phone and paying on delivery"
            className={cn(
              "text-muted-foreground tabular-nums line-through",
              large ? "text-base" : "text-xs",
            )}
          >
            {formatPrice(listCents, currency)}
          </span>
        )}
      </div>
      {discounted && note && (
        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
          Pay online with QR or card and save{" "}
          {formatPrice(listCents - online, currency)} ({ONLINE_DISCOUNT_PERCENT}
          %). Ordering by phone: {formatPrice(listCents, currency)}
        </p>
      )}
    </div>
  );
};

export default PriceBlock;

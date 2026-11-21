import { formatPrice } from "@/lib/utils";

export const PriceTag = ({
  price,
  currency,
}: {
  price: number;
  currency: string;
}) => {
  return (
    <div className="text-foreground text-3xl font-semibold tabular-nums md:text-4xl">
      {formatPrice(price, currency)}
    </div>
  );
};

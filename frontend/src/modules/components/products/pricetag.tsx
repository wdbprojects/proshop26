import { formatPrice } from "@/lib/utils";

export const PriceTag = ({
  price,
  currency,
}: {
  price: string;
  currency: string;
}) => {
  const realPrice = Number(price) * 1.15;

  return (
    <div>
      <span className="mr-3 text-xl font-light tracking-tight text-[#b91c1c]">
        -15%
      </span>
      <span className="text-foreground mt-3 text-3xl font-semibold tabular-nums md:text-4xl">
        {formatPrice(Number(price), currency)}
      </span>
      <div className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-400">
        List Price:{" "}
        <span className="line-through">{formatPrice(realPrice, currency)}</span>
      </div>
    </div>
  );
};

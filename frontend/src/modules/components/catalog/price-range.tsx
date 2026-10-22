"use client";

import { useState } from "react";
import { ProductFiltersProps } from "./product-filters";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PriceRange = ({
  facets,
  minPrice,
  maxPrice,
  setPriceRange,
}: Pick<
  ProductFiltersProps,
  "facets" | "minPrice" | "maxPrice" | "setPriceRange"
>) => {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Price (USD)</h3>
      {facets && facets.price.max > 0 && (
        <p className="text-muted-foreground text-xs">
          {formatPrice(facets.price.min, "usd")} -{" "}
          {formatPrice(facets.price.max, "usd")}
        </p>
      )}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          placeholder="Min"
          value={min}
          onChange={(event) => {
            setMin(event.target.value);
          }}
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          min="0"
          placeholder="Max"
          value={max}
          onChange={(event) => {
            setMax(event.target.value);
          }}
        />
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="w-full"
        onClick={() => {
          setPriceRange(min, max);
        }}
      >
        Apply
      </Button>
    </div>
  );
};

export default PriceRange;

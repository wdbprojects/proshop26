"use client";

import { Dispatch, MouseEvent, SetStateAction, useState } from "react";
import Star from "@/components/shared/star";

const ProductRatings = ({
  numReviews,
  value,
  onChange,
  totalStars = 5,
  precision = 0.5,
  size = 22,
}: {
  numReviews: number | null;
  value: number | null;
  onChange: Dispatch<SetStateAction<number | null>>;
  totalStars?: number;
  precision?: number;
  size?: number;
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value ?? 0;

  const getFill = (index: number) => {
    const diff = displayValue - index;
    return Math.max(0, Math.min(diff, 1));
  };

  const handleMouseMove = (
    event: MouseEvent<HTMLDivElement>,
    index: number,
  ) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - left) / width;
    const raw = index + percent;
    const snapped = Math.round(raw / precision) * precision;
    setHoverValue(snapped);
  };

  const handleClick = () => {
    onChange?.(hoverValue ?? value);
  };

  return (
    <div>
      <div className="flex items-center justify-start gap-2">
        <div className="flex items-center justify-center gap-1 rounded-md border px-2 py-1">
          {[...Array(totalStars)].map((_, index) => {
            return (
              <Star
                key={index}
                size={size}
                fill={getFill(index)}
                onMouseMove={(event: MouseEvent<HTMLDivElement>) => {
                  handleMouseMove(event, index);
                }}
                onMouseLeave={() => {
                  setHoverValue(null);
                }}
                onClick={handleClick}
              />
            );
          })}
        </div>
        <span className="text-muted-foreground text-sm">
          {numReviews === 1 ? `${numReviews} review` : `${numReviews} reviews`}
        </span>
      </div>
      <span className="text-muted-foreground ml-1 text-xs">
        {displayValue.toFixed(1)} / {totalStars}
      </span>
    </div>
  );
};

export default ProductRatings;

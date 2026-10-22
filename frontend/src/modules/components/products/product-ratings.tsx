"use client";

import { ComponentProps, KeyboardEvent, useState } from "react";
import Star from "@/components/shared/star";
import { cn } from "cn";

interface ProductRatingsProps {
  value: number;
  numReviews?: number;
  onChange?: (value: number) => void;
  totalStars?: number;
  size?: number;
  showCount?: boolean;
}

const ProductRatings = ({
  numReviews,
  value,
  onChange,
  totalStars = 5,
  size = 22,
  showCount = true,
}: ProductRatingsProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const interactive = Boolean(onChange);
  const displayValue = interactive ? (hoverValue ?? value) : value;

  const getFill = (index: number) => {
    return Math.max(0, Math.min(displayValue - index, 1));
  };

  const interactiveProps = (starValue: number): ComponentProps<"div"> => {
    if (!onChange) return {};
    return {
      role: "radio",
      "aria-checked": value === starValue,
      "aria-label": `${starValue} ${starValue === 1 ? "star" : "stars"}`,
      tabIndex: 0,
      onMouseEnter: () => setHoverValue(starValue),
      onClick: () => onChange(starValue),
      onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onChange(starValue);
        }
      },
    };
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <div
          role={interactive ? "radiogroup" : "img"}
          aria-label={
            interactive
              ? "Rate this product"
              : `${value.toFixed(1)} out of ${totalStars} stars`
          }
          className={cn(
            "flex items-center gap-1",
            interactive && "rounded-md border px-2 py-1",
          )}
          onMouseLeave={() => setHoverValue(null)}
        >
          {Array.from({ length: totalStars }, (_, index) => {
            return (
              <Star
                key={index}
                size={size}
                fill={getFill(index)}
                interactive={interactive}
                {...interactiveProps(index + 1)}
              />
            );
          })}
        </div>
        {showCount && numReviews !== undefined && (
          <span className="text-muted-foreground text-sm">
            {numReviews === 0
              ? "No ratings yet"
              : `${value.toFixed(1)} · ${numReviews} ${numReviews === 1 ? "rating" : "ratings"}`}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductRatings;

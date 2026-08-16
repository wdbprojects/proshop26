"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CategoriesList = ({
  categoryFilter,
  categoryChipsLoading,
  categories,
  setCategory,
}: {
  categoryFilter: string;
  categoryChipsLoading: boolean;
  categories: string[];
  setCategory: (category: string) => void;
}) => {
  return (
    <div className="flex flex-wrap gap-1">
      <Button
        variant={`${!categoryFilter ? "default" : "secondary"}`}
        size="sm"
        className=""
        onClick={() => setCategory("")}
      >
        All
      </Button>
      {categoryChipsLoading
        ? [1, 2, 3, 4, 5, 6].map((i) => {
            return (
              <Skeleton key={i} className="h-7 w-20 rounded-lg" aria-hidden />
            );
          })
        : categories.map((category, index) => {
            const cat = category.toLowerCase();
            return (
              <Button
                key={index}
                size="sm"
                variant={`${categoryFilter && categoryFilter === cat ? "default" : "secondary"}`}
                onClick={() => {
                  setCategory(category);
                }}
              >
                {category}
              </Button>
            );
          })}
    </div>
  );
};

export default CategoriesList;

"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategorySchemaType } from "@/config/type-schemas";

const CategoriesList = ({
  categoryFilter,
  categoryChipsLoading,
  categories,
  setCategory,
}: {
  categoryFilter: string;
  categoryChipsLoading: boolean;
  categories: CategorySchemaType[];
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
        : categories.map((category) => {
            return (
              <Button
                key={category.id}
                size="sm"
                variant={`${categoryFilter === category.slug ? "default" : "secondary"}`}
                onClick={() => {
                  setCategory(category.slug);
                }}
              >
                {category.name}
              </Button>
            );
          })}
    </div>
  );
};

export default CategoriesList;

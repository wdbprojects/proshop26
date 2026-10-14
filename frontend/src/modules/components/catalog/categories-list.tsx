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
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Categories</h3>
      <div className="flex flex-col flex-wrap gap-1 text-xs!">
        <Button
          variant={`${!categoryFilter ? "default" : "secondary"}`}
          size="sm"
          className="text-xs"
          onClick={() => setCategory("")}
        >
          All Categories
        </Button>
        {categoryChipsLoading
          ? [1, 2, 3, 4, 5].map((i) => {
              return (
                <Skeleton
                  key={i}
                  className="h-6 w-full rounded-full"
                  aria-hidden
                />
              );
            })
          : categories?.map((category) => {
              return (
                <Button
                  key={category.id}
                  size="xs"
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
    </div>
  );
};

export default CategoriesList;

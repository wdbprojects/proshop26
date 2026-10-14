"use client";

import { ProductsFacets } from "@/hooks/use-products-catalog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import PriceRange from "./price-range";
import CategoriesList from "@/modules/components/catalog/categories-list";
import { CategorySchemaType } from "@/config/type-schemas";

export interface ProductFiltersProps {
  facets?: ProductsFacets;
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  minPrice: string;
  maxPrice: string;
  setPriceRange: (min: string, max: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  categoryFilter: string;
  categoryChipsLoading: boolean;
  categories: CategorySchemaType[];
  setCategory: (category: string) => void;
}

const ProductFilters = ({
  facets,
  selectedBrands,
  toggleBrand,
  minPrice,
  maxPrice,
  setPriceRange,
  clearFilters,
  hasActiveFilters,
  categoryFilter,
  categoryChipsLoading,
  categories,
  setCategory,
}: ProductFiltersProps) => {
  const brands = (facets?.brands ?? []).filter((br) => {
    return br.brand;
  });

  return (
    <aside className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="link" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>
      <Separator />
      <CategoriesList
        categoryFilter={categoryFilter}
        categoryChipsLoading={categoryChipsLoading}
        categories={categories}
        setCategory={setCategory}
      />
      <Separator />

      {brands.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Brand</h3>
          <ul className="space-y-2">
            {brands.map(({ brand, count }) => {
              const name = brand as string;
              return (
                <li key={name}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedBrands.includes(name)}
                      onCheckedChange={() => toggleBrand(brand as string)}
                    />
                    <span className="flex-1">{name}</span>
                    <span className="text-muted-foreground text-xs">
                      ({count})
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Separator />

      {/* the key remounts this when the URL values change (e.g. after "Clear All" so its local state resets) */}

      <PriceRange
        key={`${minPrice}=${maxPrice}`}
        facets={facets}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setPriceRange={setPriceRange}
      />
    </aside>
  );
};

export default ProductFilters;

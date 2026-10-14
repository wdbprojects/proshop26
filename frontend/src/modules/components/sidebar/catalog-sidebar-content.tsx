"use client";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import ProductFilters from "@/modules/components/catalog/product-filters";
import { useProductsCatalog } from "@/hooks/use-products-catalog";

const CatalogSidebarContent = () => {
  const catalog = useProductsCatalog({ limit: 12 });
  return (
    <div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="mt-2">
            <ProductFilters
              facets={catalog.facets}
              selectedBrands={catalog.selectedBrands}
              toggleBrand={catalog.toggleBrand}
              minPrice={catalog.minPrice}
              maxPrice={catalog.maxPrice}
              setPriceRange={catalog.setPriceRange}
              clearFilters={catalog.clearFilters}
              hasActiveFilters={catalog.hasActiveFilters}
              categoryFilter={catalog.categoryFilter}
              categoryChipsLoading={catalog.categoryChipsLoading}
              categories={catalog.categories}
              setCategory={catalog.setCategory}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </div>
  );
};

export default CatalogSidebarContent;

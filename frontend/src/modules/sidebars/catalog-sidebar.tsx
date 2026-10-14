"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { useProductsCatalog } from "@/hooks/use-products-catalog";
import CatalogSidebarContent from "@/modules/components/sidebar/catalog-sidebar-content";

const CatalogSidebar = () => {
  const catalog = useProductsCatalog({ limit: 12 });

  return (
    <Sidebar className="z-40 rounded-sm border-none pt-15" variant="floating">
      <CatalogSidebarContent
        categoryFilter={catalog.categoryFilter}
        categoryChipsLoading={catalog.categoryChipsLoading}
        categories={catalog.categories}
        setCategory={catalog.setCategory}
        products={catalog.products}
        loadingProducts={catalog.loadingProducts}
        error={catalog.error}
        page={catalog.page}
        totalPages={catalog.totalPages}
        setPage={catalog.setPage}
        total={catalog.total}
        q={catalog.q}
        clearSearch={catalog.clearSearch}
        facets={catalog.facets}
        selectedBrands={catalog.selectedBrands}
        toggleBrand={catalog.toggleBrand}
        minPrice={catalog.minPrice}
        maxPrice={catalog.maxPrice}
        setPriceRange={catalog.setPriceRange}
        clearFilters={catalog.clearFilters}
        hasActiveFilters={catalog.hasActiveFilters}
      />
    </Sidebar>
  );
};

export default CatalogSidebar;

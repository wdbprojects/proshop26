"use client";

import { useProductsCatalog } from "@/hooks/use-products-catalog";
import ProductsCatalog from "@/modules/components/catalog/products-catalog";

const ProductsPage = () => {
  const catalog = useProductsCatalog({ limit: 12 });

  return (
    <div className="h-full space-y-8 p-4">
      <ProductsCatalog
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
    </div>
  );
};

export default ProductsPage;

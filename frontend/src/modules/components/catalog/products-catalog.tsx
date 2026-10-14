import { CategorySchemaType, ProductType } from "@/config/type-schemas";
import CategoriesList from "@/modules/components/catalog/categories-list";
import CategoriesProducts from "@/modules/components/catalog/categories-products";
import ProductFilters from "@/modules/components/catalog/product-filters";
import PaginationControls from "./pagination-controls";
import { ProductsFacets } from "@/hooks/use-products-catalog";

import { Button } from "@/components/ui/button";

const ProductsCatalog = ({
  categoryFilter,
  categoryChipsLoading,
  categories,
  setCategory,
  loadingProducts,
  products,
  error,
  page,
  totalPages,
  setPage,
  total,
  q,
  clearSearch,
  facets,
  selectedBrands,
  toggleBrand,
  minPrice,
  maxPrice,
  setPriceRange,
  clearFilters,
  hasActiveFilters,
}: {
  categoryFilter: string;
  categoryChipsLoading: boolean;
  categories: CategorySchemaType[];
  setCategory: (category: string) => void;
  loadingProducts: boolean;
  products: ProductType[];
  error: Error | null;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  total: number;
  q: string;
  clearSearch: () => void;
  facets?: ProductsFacets;
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  minPrice: string;
  maxPrice: string;
  setPriceRange: (min: string, max: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}) => {
  return (
    <section className="flex h-full flex-col">
      <div className="mb-6 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold uppercase md:text-3xl">
            {q ? "Search results" : "All Products"}
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
            {q && (
              <>
                <span>for &quot;{q}&quot;</span>
                <Button variant="link" size="xs" onClick={clearSearch}>
                  Clear search
                </Button>
              </>
            )}
            {!loadingProducts && (
              <span>
                {total} {total === 1 ? "product" : "products"}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="h-full w-full">
        <div className="flex h-full flex-col items-center justify-between">
          <div className="w-full">
            <CategoriesProducts
              error={error}
              loadingProducts={loadingProducts}
              products={products}
            />
          </div>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </section>
  );
};

export default ProductsCatalog;

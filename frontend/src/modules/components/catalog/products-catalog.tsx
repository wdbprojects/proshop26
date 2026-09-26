import { CategorySchemaType, ProductType } from "@/config/type-schemas";
import CategoriesList from "@/modules/components/catalog/categories-list";
import CategoriesProducts from "@/modules/components/catalog/categories-products";
import PaginationControls from "./pagination-controls";

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
}) => {
  return (
    <section className="h-full">
      <div className="flex h-full flex-col items-center justify-between">
        <div className="w-full space-y-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-foreground text-2xl font-bold uppercase md:text-3xl">
                All Products
              </h1>
            </div>
            {/* CATEGORIES LIST */}
            <CategoriesList
              categoryFilter={categoryFilter}
              categoryChipsLoading={categoryChipsLoading}
              categories={categories}
              setCategory={setCategory}
            />
          </div>
          {/* PRODUCTS GRID */}
          <CategoriesProducts
            error={error}
            loadingProducts={loadingProducts}
            products={products}
          />
        </div>
        <div>
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

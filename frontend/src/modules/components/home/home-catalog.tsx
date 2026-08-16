import { ProductCreateSchemaType } from "@/config/type-schemas";
import CategoriesList from "./categories-list";
import CategoriesProducts from "./categories-products";

const HomeCatalog = ({
  categoryFilter,
  categoryChipsLoading,
  categories,
  setCategory,
  loadingProducts,
  products,
  error,
}: {
  categoryFilter: string;
  categoryChipsLoading: boolean;
  categories: string[];
  setCategory: (category: string) => void;
  loadingProducts: boolean;
  products: ProductCreateSchemaType[];
  error: Error | null;
}) => {
  return (
    <section id="catalog" className="scroll-mt-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold uppercase md:text-2xl">
            Catalog
          </h2>
        </div>
        {/* CATEGORIES LIST */}
        <CategoriesList
          categoryFilter={categoryFilter}
          categoryChipsLoading={categoryChipsLoading}
          categories={categories}
          setCategory={setCategory}
        />
      </div>
      {/* CATEGORIES PRODUCTS */}
      <CategoriesProducts
        error={error}
        loadingProducts={loadingProducts}
        products={products}
      />
    </section>
  );
};

export default HomeCatalog;

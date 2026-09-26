"use client";

import { useProductsCatalog } from "@/hooks/use-products-catalog";
import ProductsCatalog from "@/modules/components/catalog/products-catalog";

const ProductsPage = () => {
  const {
    categoryFilter,
    categoryChipsLoading,
    categories,
    setCategory,
    products,
    loadingProducts,
    error,
    page,
    totalPages,
    setPage,
  } = useProductsCatalog({ limit: 12 });
  return (
    <div className="h-full space-y-8 p-4">
      <ProductsCatalog
        categoryFilter={categoryFilter}
        categoryChipsLoading={categoryChipsLoading}
        categories={categories}
        setCategory={setCategory}
        products={products}
        loadingProducts={loadingProducts}
        error={error}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
};

export default ProductsPage;

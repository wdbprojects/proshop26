import ErrorCard from "@/components/shared/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductType } from "@/config/type-schemas";
import CatalogProductCard from "@/modules/components/catalog/catalog-product-card";

const GRID =
  "grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

const CategoriesProducts = ({
  loadingProducts,
  error,
  products,
}: {
  loadingProducts: boolean;
  error: Error | null;
  products: ProductType[];
}) => {
  return loadingProducts ? (
    <ul className={GRID}>
      {Array.from({ length: 12 }).map((_, index) => {
        return (
          <li key={index} className="space-y-2">
            <Skeleton className="aspect-4/5 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </li>
        );
      })}
    </ul>
  ) : error ? (
    <ErrorCard />
  ) : products.length === 0 ? (
    <div className="border-muted bg-muted/30 text-muted-foreground rounded-md border py-16 text-center">
      No products in this category yet!
    </div>
  ) : (
    <ul className={GRID}>
      {products.map((product) => {
        return (
          <li key={product.id}>
            <CatalogProductCard product={product} />
          </li>
        );
      })}
    </ul>
  );
};

export default CategoriesProducts;

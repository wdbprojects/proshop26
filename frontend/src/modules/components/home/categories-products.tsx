import ErrorCard from "@/components/shared/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCreateSchemaType } from "@/config/type-schemas";
import CatalogProductCard from "@/modules/components/home/catalog-product-card";

const CategoriesProducts = ({
  loadingProducts,
  error,
  products,
}: {
  loadingProducts: boolean;
  error: Error | null;
  products: ProductCreateSchemaType[];
}) => {
  return loadingProducts ? (
    <ul className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => {
        return (
          <li key={item}>
            <Skeleton className="h-96 w-full rounded-md" />
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
    <ul className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

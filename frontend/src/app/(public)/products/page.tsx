import { Suspense } from "react";
import ProductsPage from "@/modules/presentation/products/products-page";

const ProductsPageMain = () => {
  return (
    <Suspense fallback={null}>
      <ProductsPage />
    </Suspense>
  );
};

export default ProductsPageMain;

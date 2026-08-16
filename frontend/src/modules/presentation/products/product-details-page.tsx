"use client";

import { useProductDetails } from "@/hooks/use-product-details";
import ProductDetailsSkeleton from "@/modules/components/products/product-details-skeleton";
import ErrorCard from "@/components/shared/error-card";
import ProductDetailsContent from "@/modules/components/products/product-details-content";

const ProductDetailsPage = ({ slug }: { slug: string }) => {
  const { product, loadingProductDetails, productDetailsError } =
    useProductDetails(slug);

  if (loadingProductDetails) {
    return <ProductDetailsSkeleton />;
  }

  if (productDetailsError || !product) {
    return <ErrorCard />;
  }

  return <ProductDetailsContent product={product} />;
};

export default ProductDetailsPage;

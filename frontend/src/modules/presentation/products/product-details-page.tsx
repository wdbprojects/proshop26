"use client";

import { useProductDetails } from "@/hooks/use-product-details";
import ProductDetailsSkeleton from "@/modules/components/products/product-details-skeleton";
import ErrorCard from "@/components/shared/error-card";
import ProductDetailsContent from "@/modules/components/products/product-details-content";
import { notFound } from "next/navigation";

const ProductDetailsPage = ({ slug }: { slug: string }) => {
  const { product, loadingProductDetails, productDetailsError } =
    useProductDetails(slug);

  if (loadingProductDetails) {
    return <ProductDetailsSkeleton />;
  }

  /* if (!product) {
    return notFound()
  } */

  if (productDetailsError || !product) {
    return <ErrorCard />;
  }

  const primaryImage = product.images?.find((img) => img?.isPrimary) ??
    product.images?.[0] ?? {
      id: "placeholder",
      url: "https://placehold.co/600x600/png",
      alt: null,
      order: 0,
      isPrimary: true,
      imageKitFileId: null,
    };

  return (
    <ProductDetailsContent product={product} primaryImage={primaryImage} />
  );
};

export default ProductDetailsPage;

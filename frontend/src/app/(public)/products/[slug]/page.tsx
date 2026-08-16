import ProductDetailsPage from "@/modules/presentation/products/product-details-page";

const ProductDetailsPageMain = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  return <ProductDetailsPage slug={slug} />;
};

export default ProductDetailsPageMain;

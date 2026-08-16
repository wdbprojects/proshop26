"use client";

import { useProductDetailsId } from "@/hooks/use-product-details";
import CreateUpdateProductForm from "@/modules/components/admin/create-update-product-form";

const EditProductPage = ({ id }: { id: string }) => {
  const { product, isLoading, error } = useProductDetailsId(id);

  return (
    <div className="h-full w-full space-y-4 p-4">
      <h2 className="text-2xl font-medium tracking-tight">Edit Product</h2>
      <CreateUpdateProductForm product={product} />
    </div>
  );
};

export default EditProductPage;

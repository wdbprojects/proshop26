import CreateUpdateProductForm from "@/modules/components/admin/create-update-product-form";

const CreateProductPage = () => {
  return (
    <div className="h-full w-full space-y-4 p-4">
      <h2 className="text-2xl font-medium tracking-tight">
        Create New Product
      </h2>
      <CreateUpdateProductForm />
    </div>
  );
};

export default CreateProductPage;

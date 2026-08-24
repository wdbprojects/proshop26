import EditProductPage from "@/modules/presentation/admin/edit-product-page";

const EditProductPageMain = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return <EditProductPage id={id} />;
};

export default EditProductPageMain;

"use client";

import { IAdminProduct } from "@/config/types";
import { useAdminProduct } from "@/hooks/use-admin-product";
import CreateUpdateProductForm from "./create-update-product-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const EditAction = ({ product }: { product: IAdminProduct }) => {
  const { modalOpen, setModalOpen, setEditing, categories } = useAdminProduct();

  return (
    <div className="flex items-center justify-center">
      <Link
        href={routes.editProduct(product.id)}
        className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
      >
        <Pencil />
      </Link>

      {/* <CreateUpdateProductForm
        initial={product}
        saving={saveMutation.isPending}
        error={saveMutation.isError}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={(data) =>
          saveMutation.mutate({ body: data, id: product?.id })
        }
        setModalOpen={setModalOpen}
        modalOpen={modalOpen}
        categories={categories}
      /> */}
    </div>
  );
};

export default EditAction;

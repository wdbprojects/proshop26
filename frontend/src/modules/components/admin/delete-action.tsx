"use client";

import { useAdminProduct } from "@/hooks/use-admin-product";
import EditProduct from "@/modules/components/admin/edit-action";

import { IAdminProduct } from "@/config/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const DeleteAction = ({ product }: { product: IAdminProduct }) => {
  const { modalOpen, setModalOpen, deleteMutation } = useAdminProduct();
  const id = product?.id;

  // check if delete is in progress
  const isDeleting = deleteMutation.isPending;

  const handleDeleteProduct = () => {
    deleteMutation.mutate(
      { productId: id },
      {
        onSuccess: () => {
          setModalOpen(false);
          toast.info(`Successfully deleted product: ${product.name}`);
        },
        onError: (err) => {
          toast.error(
            `Failed to delete product: ${err.message || "Unknown error"}`,
          );
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-center">
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogTrigger
          render={<Button variant="destructive" disabled={isDeleting} />}
        >
          <Trash2 />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this product?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-between gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner />
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Trash2 />
                  <span>Delete Product</span>
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteAction;

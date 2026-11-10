"use client";

import { useState } from "react";
import {
  useAdminCategories,
  useCategoryActions,
} from "@/hooks/use-admin-categories";
import { IAdminCategory } from "@/config/type-schemas";
import { getCategoryColumns } from "@/modules/components/admin/categories-columns";
import ErrorCard from "@/components/shared/error-card";
import { PlusIcon, TagsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/modules/components/admin/products-table";
import CategoryDialog from "@/modules/components/admin/category-dialog";
import ConfirmDialog from "@/components/shared/confirm-dialog";

const AdminCategoriesPage = () => {
  const { data, isLoading, isError } = useAdminCategories();
  const { update, remove } = useCategoryActions();
  const [dialog, setDialog] = useState<{
    open: boolean;
    category?: IAdminCategory;
  }>({ open: false });
  const [deleting, setDeleting] = useState<IAdminCategory | null>(null);

  const columns = getCategoryColumns({
    onEdit: (category) => setDialog({ open: true, category: category }),
    onToggle: (category) => {
      return update.mutate({
        id: category.id,
        values: { active: !category.active },
      });
    },
    onDelete: setDeleting,
    busy: update.isPending,
  });

  if (isError) return <ErrorCard />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <TagsIcon className="text-primary size-7" />
          <span>Categories</span>
        </h1>
        <Button onClick={() => setDialog({ open: true })}>
          <PlusIcon className="size-4" />
          <span>New category</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((item) => {
            return <Skeleton key={item} className="h-12 w-full" />;
          })}
        </div>
      ) : (
        <DataTable columns={columns} data={data?.categories ?? []} />
      )}

      <CategoryDialog
        open={dialog.open}
        category={dialog.category}
        onOpenChange={(open) => {
          return setDialog((prev) => {
            return { ...prev, open: open };
          });
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this category"
        description={`"${deleting?.name ?? ""}" has no products, so it can be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
};

export default AdminCategoriesPage;

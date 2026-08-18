"use client";

import { useAdminProduct } from "@/hooks/use-admin-product";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useEffect } from "react";

import { PackageIcon } from "lucide-react";
import { DataTable } from "@/modules/components/admin/products-table";
import { columns } from "@/modules/components/admin/columns";
import ProductsSkeleton from "@/modules/components/admin/products-skeleton";

import { Button, buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import Link from "next/link";

const AdminPage = () => {
  const router = useRouter();
  const { session, isLoading } = useSession();
  const user = session?.user;
  const token = session?.session.token;

  const {
    modalOpen,
    setModalOpen,
    editing,
    setEditing,
    products,
    categories,
    dataProductsLoading,
    deleteMutation,
  } = useAdminProduct();

  useEffect(() => {
    if (isLoading) return;
    if (!session || user?.role !== "admin") {
      router.push(routes.home);
    }
  }, [session, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Admin Page</h2>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PackageIcon className="text-secondary size-8" aria-hidden />
            <div>
              <h1 className="text-foreground text-2xl font-bold">Products</h1>
              <p className="text-foreground/70 text-sm">
                Manage catalog (admin only)
              </p>
            </div>
          </div>
          <Button variant="default" disabled={true}>
            Create Product
          </Button>
        </div>

        <div className="mt-4 border-t py-4">
          <ProductsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Admin Page</h2>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <PackageIcon className="text-primary size-8" aria-hidden />
          <div>
            <h1 className="text-foreground text-2xl font-bold">Products</h1>
            <p className="text-foreground/70 text-sm">
              Manage catalog (admin only)
            </p>
          </div>
        </div>
        <Link
          href={routes.createProduct}
          className={cn(buttonVariants({ variant: "default", size: "sm" }))}
        >
          Create Product
        </Link>
      </div>
      <div className="mt-4 border-t py-4">
        <DataTable columns={columns} data={products} />
      </div>
    </div>
  );
};

export default AdminPage;

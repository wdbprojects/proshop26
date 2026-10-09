"use client";

import { buttonVariants } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { ProductType } from "@/config/type-schemas";

const EditAction = ({ product }: { product: ProductType }) => {
  return (
    <div className="flex items-center justify-center">
      <Link
        href={routes.editProduct(product.id)}
        className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
      >
        <Pencil />
      </Link>
    </div>
  );
};

export default EditAction;

import Link from "next/link";
import { routes } from "@/config/routes";
import { ProductType } from "@/config/type-schemas";
import { cn } from "@/lib/utilsPREV";
import { ArrowRightIcon } from "lucide-react";
import CategoriesProducts from "@/modules/components/catalog/categories-products";
import { buttonVariants } from "@/components/ui/button";

const FeaturedProducts = ({
  loadingProducts,
  products,
  error,
}: {
  loadingProducts: boolean;
  products: ProductType[];
  error: Error | null;
}) => {
  return (
    <section id="featured" className="scroll-mt-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold uppercase md:text-2xl">
            Featured Products
          </h2>
        </div>
        <Link
          href={routes.products}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "flex w-fit items-center gap-1.5",
          )}
        >
          <span>Browse all products</span>
          <ArrowRightIcon className="size-3.5" aria-hidden />
        </Link>
      </div>
      <CategoriesProducts
        error={error}
        loadingProducts={loadingProducts}
        products={products}
      />
    </section>
  );
};

export default FeaturedProducts;

import Link from "next/link";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { ListOrdered, ShoppingCartIcon } from "lucide-react";

const EmptyCart = () => {
  return (
    <Card className="flex min-h-50 w-full max-w-md items-center justify-center">
      <CardContent>
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          When you add products from the catalog, they&apos;ll show up here.
          Ready when you are.
        </p>
      </CardContent>
      <CardAction className="flex w-full items-center justify-between gap-4 px-4">
        <Link
          href={routes.home}
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "w-full flex-1",
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <ShoppingCartIcon />
            <span>Browse Catalog</span>
          </div>
        </Link>
        <Link
          href={routes.orders}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full flex-1",
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <ListOrdered />
            <span>View Orders</span>
          </div>
        </Link>
      </CardAction>
    </Card>
  );
};

export default EmptyCart;

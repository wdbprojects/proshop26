"use client";

import Link from "next/link";
import { useCartCount } from "@/hooks/use-cart-count";
import { routes } from "@/config/routes";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";

const CartLink = () => {
  const { count } = useCartCount();
  const total = count ?? 0;

  return (
    <Link
      href={routes.cart}
      aria-label={total > 0 ? `Cart, ${total} items` : "Cart"}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-lg" }),
        "relative",
      )}
    >
      <ShoppingCartIcon className="size-5" />
      {total > 0 && (
        <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums">
          {total > 99 ? "99" : total}
        </span>
      )}
    </Link>
  );
};

export default CartLink;

"use client";

import DarkMode from "@/components/shared/dark-mode";
import SignOutButton from "../auth/sign-out-button";
import AppLogo from "@/components/shared/app-logo";
import LoginButton from "../auth/login-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Button, buttonVariants } from "@/components/ui/button";
import { Lock, Package, ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";

const HeaderDashboard = () => {
  const getSession = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch user session");
    }
    return response.json();
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    retry: false,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
    enabled: true,
  });

  const cartCount = useCart((state) => {
    return state.items.reduce((num, line) => {
      return num + line.quantity;
    }, 0);
  });

  if (isLoading) {
    return (
      <header className="bg-background fixed top-0 right-0 z-50 h-auto w-full border-b px-2 py-2">
        <div className="container mx-auto flex w-full items-center justify-between gap-1 sm:gap-2">
          <AppLogo />
          <div className="flex shrink-0 items-center gap-2 p-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-22" />
            <Skeleton className="h-5 w-9 rounded-lg" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background fixed top-0 right-0 z-50 h-auto w-full border-b px-2 py-2">
      <div className="container mx-auto flex w-full items-center justify-between gap-1 sm:gap-2">
        {/* // MENU & LOGO  & NAV LINKS */}
        <AppLogo />
        {/* // AUTH & BUTTONS */}
        <div className="flex shrink-0 items-center gap-4 p-1">
          {data?.session && (
            <div className="flex flex-row items-center justify-end gap-2">
              <div>
                <span className="text-muted-foreground text-xs">
                  Signed as:{" "}
                </span>
                <span className="text-muted-foreground text-xs font-bold">
                  {data?.user?.name}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Role: </span>
                <span className="text-muted-foreground text-xs font-bold">
                  {data?.user?.role}
                </span>
              </div>
            </div>
          )}
          {data?.session && data?.user?.role === "admin" && (
            <Link
              href={routes.admin}
              className={cn(
                buttonVariants({ size: "sm", variant: "secondary" }),
                "flex items-center justify-center gap-2",
              )}
            >
              <Lock className="size-3.5" />
              <span>Admin</span>
            </Link>
          )}
          <Link href={routes.home}>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <ShoppingBag className="size-3.5" />
              <span>Shop</span>
            </Button>
          </Link>

          <Link
            className={cn(
              "flex items-center justify-center gap-2",
              buttonVariants({ size: "sm", variant: "outline" }),
            )}
            href={routes.orders}
          >
            <Package className="size-3.5" />
            <span>Orders</span>
          </Link>

          <Link
            href={routes.cart}
            className={cn(
              `indicator relative flex cursor-pointer items-center justify-between gap-2 rounded-md`,
              buttonVariants({
                variant: "outline",
                size: "sm",
              }),
            )}
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items.` : "Cart"}
          >
            <ShoppingCart className="mr-0.5 size-4.5" />
            <Badge variant="default" className="rounded-md px-1! text-xs">
              {cartCount > 99 ? 99 : cartCount}
              {cartCount > 99 && <sup className="">+</sup>}
            </Badge>
          </Link>

          {!data?.session ? (
            <LoginButton variant="secondary" />
          ) : (
            <SignOutButton />
          )}
          <DarkMode />
        </div>
      </div>
    </header>
  );
};

export default HeaderDashboard;

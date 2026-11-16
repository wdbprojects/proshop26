"use client";

import { useState } from "react";
import DarkMode from "@/components/shared/dark-mode";
import { BRAND_NAME } from "@/config/brand";
import { accountLinks } from "@/config/data";
import { routes } from "@/config/routes";
import { useUser } from "@/hooks/use-session";
import { useSignOut } from "@/hooks/use-sign-out";
import { cn } from "cn";
import Link from "next/link";

import { LogOutIcon, MenuIcon, ShoppingBagIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const linkClass =
  "hover:bg-muted flex items-center gap-3 rounded-xl px-3 py-3 text-base";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const signOut = useSignOut();
  const close = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Open menu"
            className="md:hidden"
          />
        }
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{BRAND_NAME}</SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation
          </SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col px-3">
          <Link href={routes.catalog} onClick={close} className="linkClass">
            <ShoppingBagIcon className="size-5" />
            <span>Products</span>
          </Link>
          {user &&
            accountLinks.map((item) => {
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={close}
                  className={linkClass}
                >
                  <item.icon className="size-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
        </nav>

        <div className="mt-auto space-y-3 border-t p-4">
          <div className="flex items-center justify-between px-1 text-sm">
            <span>Dark mode</span>
            <DarkMode />
          </div>
          {user ? (
            <>
              <div className="px-1 text-sm leading-tight">
                <p className="truncate font-medium">{user.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {user.email}
                </p>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                disabled={signOut.isPending}
                onClick={() => signOut.mutate()}
              >
                <LogOutIcon className="size-4" />
                <span>Log out</span>
              </Button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={routes.login}
                onClick={close}
                className={cn(buttonVariants({ variant: "default" }), "w-full")}
              >
                Log in
              </Link>
              <Link
                href={routes.login}
                onClick={close}
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;

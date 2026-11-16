"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import SearchBar from "../search/search-bar";
import { SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import SidebarTriggerCustom from "@/modules/components/misc/sidebar-trigger-custom";
import AppLogo from "@/components/shared/app-logo";
import CartLink from "@/modules/components/layout/cart-link";
import AccountMenu from "./account-menu";
import DarkMode from "@/components/shared/dark-mode";
import MobileMenu from "@/modules/components/layout/mobile-menu";

const SiteHeader = ({ sidebar }: { sidebar?: "dashboard" | "catalog" }) => {
  const pathname = usePathname();
  // remember WHERE search was opened: when the page changes, it counts as closed
  const [searchPath, setSearchPath] = useState<string | null>(null);
  const searchOpen = searchPath === pathname;

  return (
    <header className="bg-background fixed inset-x-0 top-0 z-50 h-14 border-b">
      <div className="container mx-auto flex h-full items-center gap-2 px-3">
        {/* mobile search mode */}
        {searchOpen && (
          <div className="flex w-full items-center gap-2 md:hidden">
            <div className="min-w-0 flex-1">
              <SearchBar autoFocus />
            </div>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Close search"
              onClick={() => setSearchPath(null)}
            >
              <XIcon className="size-5" />
            </Button>
          </div>
        )}

        <div
          className={cn(
            "flex h-full w-full items-center gap-2",
            searchOpen && "hidden md:flex",
          )}
        >
          {sidebar && (
            <SidebarTriggerCustom isCatalog={sidebar === "catalog"} />
          )}
          <AppLogo />

          <div className="hidden min-w-0 flex-1 justify-center md:flex">
            <SearchBar autoFocus />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Search"
              className="md:hidden"
              onClick={() => setSearchPath(pathname)}
            >
              <SearchIcon className="size-5" />
            </Button>
            <CartLink />
            <div className="hidden items-center gap-3 md:flex">
              <DarkMode />
              <AccountMenu />
            </div>
            {!sidebar && <MobileMenu />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;

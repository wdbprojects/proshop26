"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

const SidebarTriggerCustom = ({ isCatalog }: { isCatalog: boolean }) => {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleSidebar}
      className="relative"
    >
      <Menu className="size-4.5" />
      {isCatalog && (
        <span className="text-primary-foreground absolute -top-2.5 animate-pulse rounded-full bg-green-500 px-1.5 py-0.5 text-[8px] font-medium shadow">
          Filters
        </span>
      )}
    </Button>
  );
};

export default SidebarTriggerCustom;

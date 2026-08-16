"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

const SidebarTriggerCustom = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <Button size="icon" variant="ghost" onClick={toggleSidebar}>
      <Menu className="size-4.5" />
    </Button>
  );
};

export default SidebarTriggerCustom;

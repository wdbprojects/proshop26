import { Sidebar } from "@/components/ui/sidebar";
import React from "react";
import CatalogSidebarContent from "@/modules/components/sidebar/catalog-sidebar-content";

const CatalogSidebar = () => {
  return (
    <Sidebar className="z-40 rounded-sm border-none pt-16" variant="floating">
      <CatalogSidebarContent />
    </Sidebar>
  );
};

export default CatalogSidebar;

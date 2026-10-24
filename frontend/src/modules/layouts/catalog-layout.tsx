import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutPropsMain } from "@/config/types";
import { cookies } from "next/headers";
import HeaderCatalog from "@/modules/components/layout/header-catalog";
import CatalogSidebar from "@/modules/sidebars/catalog-sidebar";

const CatalogLayout = async ({ children }: LayoutPropsMain) => {
  // const cookieStore = await cookies();
  // const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={true}>
      <HeaderCatalog />
      <div className="flex w-full overflow-y-auto">
        <CatalogSidebar />
        <main className="h-full w-full pt-12">
          <div className="h-full p-4">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CatalogLayout;

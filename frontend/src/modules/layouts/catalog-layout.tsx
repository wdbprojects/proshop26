import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutPropsMain } from "@/config/types";
import SiteHeader from "@/modules/components/layout/site-header";
import CatalogSidebar from "@/modules/sidebars/catalog-sidebar";

const CatalogLayout = async ({ children }: LayoutPropsMain) => {
  // const cookieStore = await cookies();
  // const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={true}>
      <SiteHeader sidebar="catalog" />
      <div className="flex w-full overflow-y-auto">
        <CatalogSidebar />
        <main className="h-full w-full pt-14">
          <div className="h-full p-4">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CatalogLayout;

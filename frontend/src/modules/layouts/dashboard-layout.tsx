import RoleGuard from "@/components/shared/role-guard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutPropsMain } from "@/config/types";
import SiteHeader from "@/modules/components/layout/site-header";
import DashboardSidebar from "@/modules/sidebars/dashboard-sidebar";
// import { cookies } from "next/headers";

const DashboardLayout = async ({ children }: LayoutPropsMain) => {
  // const cookieStore = await cookies();
  // const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <RoleGuard>
      <SidebarProvider defaultOpen={true}>
        <SiteHeader sidebar="dashboard" />
        <div className="flex w-full overflow-y-auto">
          <DashboardSidebar />
          <main className="w-full pt-14">
            <div className="p-4">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </RoleGuard>
  );
};

export default DashboardLayout;

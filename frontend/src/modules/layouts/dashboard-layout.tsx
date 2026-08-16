import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutPropsMain } from "@/config/types";
import HeaderDashboard from "@/modules/components/layout/header-dashboard";
import DashboardSidebar from "@/modules/sidebars/dashboard-sidebar";
import { cookies } from "next/headers";

const DashboardLayout = async ({ children }: LayoutPropsMain) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <HeaderDashboard />
      <div className="flex w-full overflow-y-auto">
        <DashboardSidebar />
        <main className="w-full pt-12">
          <div className="p-4">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

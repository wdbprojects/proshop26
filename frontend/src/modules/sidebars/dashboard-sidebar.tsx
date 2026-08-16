import { Sidebar } from "@/components/ui/sidebar";
import DashboardSidebarContent from "@/modules/components/sidebar/dashboard-sidebar-content";

const DashboardSidebar = () => {
  return (
    <Sidebar
      className="z-40 rounded-sm border-none pt-15"
      variant="floating"
      collapsible="icon"
    >
      <DashboardSidebarContent />
    </Sidebar>
  );
};

export default DashboardSidebar;

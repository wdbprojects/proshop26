import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import NavMain from "@/modules/components/sidebar/nav-main";
import NavUser from "@/modules/components/sidebar/nav-user";

const DashboardSidebarContent = () => {
  return (
    <>
      {/* <SidebarHeader>Dashboard</SidebarHeader> */}
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </>
  );
};

export default DashboardSidebarContent;

import { LayoutPropsMain } from "@/config/types";
import DashboardLayout from "@/modules/layouts/dashboard-layout";

const DashboardLayoutMain = ({ children }: LayoutPropsMain) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardLayoutMain;

import RoleGuard from "@/components/shared/role-guard";
import { LayoutPropsMain } from "@/config/types";

const AdminLayoutMain = ({ children }: LayoutPropsMain) => {
  return <RoleGuard allow={["admin"]}>{children}</RoleGuard>
}

export default AdminLayoutMain;

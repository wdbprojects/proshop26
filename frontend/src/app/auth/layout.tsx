import { LayoutPropsMain } from "@/config/types";
import AuthLayout from "@/modules/layouts/auth-layout";

const AuthLayoutMain = ({ children }: LayoutPropsMain) => {
  return <AuthLayout>{children}</AuthLayout>;
};

export default AuthLayoutMain;

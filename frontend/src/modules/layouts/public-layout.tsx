import { LayoutPropsMain } from "@/config/types";
import HeaderMain from "@/modules/components/layout/header-main";
import FooterMain from "../components/layout/footer-main";

const PublicLayout = ({ children }: LayoutPropsMain) => {
  return (
    <div className="flex h-screen flex-col pt-12">
      <HeaderMain />
      <main className="container mx-auto flex-1">{children}</main>
      <FooterMain />
    </div>
  );
};

export default PublicLayout;

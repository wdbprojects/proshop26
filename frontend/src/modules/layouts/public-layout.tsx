import { LayoutPropsMain } from "@/config/types";
import FooterMain from "@/modules/components/layout/footer-main";
import SiteHeader from "@/modules/components/layout/site-header";

const PublicLayout = ({ children }: LayoutPropsMain) => {
  return (
    <div className="flex min-h-svh flex-col pt-14">
      <SiteHeader />
      <main className="container mx-auto flex-1">{children}</main>
      <FooterMain />
    </div>
  );
};

export default PublicLayout;

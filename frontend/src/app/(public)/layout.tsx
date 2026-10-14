import { LayoutPropsMain } from "@/config/types";
import PublicLayout from "@/modules/layouts/public-layout";

const PublicLayoutMain = ({ children }: LayoutPropsMain) => {
  return <PublicLayout>{children}</PublicLayout>;
};

export default PublicLayoutMain;

import PublicLayout from "@/modules/layouts/public-layout";
import { LayoutPropsMain } from "@/config/types";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";

const HomeLayoutMain = ({ children }: LayoutPropsMain) => {
  return <PublicLayout>{children}</PublicLayout>;
};

export default HomeLayoutMain;

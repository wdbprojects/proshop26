import PublicLayout from "@/modules/layouts/public-layout";
import { LayoutPropsMain } from "@/config/types";

const CartLayoutMain = ({ children }: LayoutPropsMain) => {
  return <PublicLayout>{children}</PublicLayout>;
};

export default CartLayoutMain;

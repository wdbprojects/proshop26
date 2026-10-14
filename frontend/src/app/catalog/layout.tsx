import { LayoutPropsMain } from "@/config/types";
import CatalogLayout from "@/modules/layouts/catalog-layout";

const CatalogLayoutMain = ({ children }: LayoutPropsMain) => {
  return <CatalogLayout>{children}</CatalogLayout>;
};

export default CatalogLayoutMain;

import { routes } from "@/config/routes";
import Link from "next/link";
import { StoreIcon } from "lucide-react";
import { BRAND_NAME } from "@/config/brand";

const AppLogo = () => {
  return (
    <Link
      href={routes.home}
      aria-label={`${BRAND_NAME} home`}
      className="flex shrink-0 items-center gap-2"
    >
      <StoreIcon className="text-primary size-5" />
      <span className="text-foreground text-xl font-bold tracking-tight">
        {BRAND_NAME}
      </span>
    </Link>
  );
};

export default AppLogo;

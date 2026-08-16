"use client";

import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import SidebarTriggerCustom from "@/modules/components/misc/sidebar-trigger-custom";
import Link from "next/link";
import { StoreIcon } from "lucide-react";

const AppLogo = () => {
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");

  return (
    <div className="flex flex-1 shrink-0 items-center gap-2 p-1">
      {isDashboard && <SidebarTriggerCustom />}
      <Link href={routes.home} className="flex flex-row items-center gap-0">
        <StoreIcon className="mr-2 size-4" />
        <h6 className="text-primary text-xl font-bold tracking-tight">La</h6>
        <h6 className="text-foreground text-xl font-bold tracking-tight">
          Tienda
        </h6>
      </Link>
    </div>
  );
};

export default AppLogo;

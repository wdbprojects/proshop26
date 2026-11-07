"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { routes } from "@/config/routes";
import { useUser } from "@/hooks/use-session";
import { getNavForRole } from "@/config/data";
import { UserRole } from "@/config/type-schemas";
import { useOrdersSummary } from "@/hooks/use-managed-orders";

// "/dashboard" must match exactly, or it would be active on every page below it
const isActive = (url: string, pathname: string) => {
  if (url === routes.dashboard) return pathname === url;
  return pathname === url || pathname.startsWith(`${url}/`);
};

const NavMain = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const { setOpenMobile } = useSidebar();
  const groups = getNavForRole((user?.role ?? "customer") as UserRole);

  const isStaff = user?.role === "support" || user?.role === "admin";
  const { data: summary } = useOrdersSummary(isStaff);
  return (
    <>
      {groups.map((group) => {
        return (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent className="list-none space-y-1">
              {group.items.map((item) => {
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive(item.url, pathname)}
                      tooltip={item.title}
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.id === "orders" &&
                      isStaff &&
                      (summary?.unfulfilled ?? 0) > 0 && (
                        <SidebarMenuBadge>
                          {summary?.unfulfilled}
                        </SidebarMenuBadge>
                      )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </>
  );
};

export default NavMain;

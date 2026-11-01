import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/config/type-schemas";

import { routes } from "@/config/routes";
import {
  CreditCardIcon,
  HeadphonesIcon,
  ShieldCheckIcon,
  TruckIcon,
  BoxesIcon,
  Gauge,
  PackageIcon,
  UserIcon,
} from "lucide-react";

export type DashboardNavItem = {
  id: string;
  title: string;
  url: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export type DashboardNavGroup = {
  id: string;
  title: string;
  items: DashboardNavItem[];
};

const All_ROLES: UserRole[] = ["customer", "support", "admin"];

export const dashboardNav: DashboardNavGroup[] = [
  {
    id: "account",
    title: "Account",
    items: [
      {
        id: "overview",
        title: "Overview",
        url: routes.dashboard,
        icon: Gauge,
        roles: All_ROLES,
      },
      {
        id: "orders",
        title: "Orders",
        url: routes.orders,
        icon: PackageIcon,
        roles: All_ROLES,
      },
      {
        id: "profile",
        title: "Profile",
        url: routes.profile,
        icon: UserIcon,
        roles: All_ROLES,
      },
    ],
  },
  {
    id: "management",
    title: "Management",
    items: [
      {
        id: "products",
        title: "Products",
        url: routes.admin,
        icon: BoxesIcon,
        roles: ["admin"],
      },
    ],
  },
];

export const getNavForRole = (role: UserRole) => {
  return dashboardNav
    .map((group) => {
      return {
        ...group,
        items: group.items.filter((item) => {
          return item.roles.includes(role);
        }),
      };
    })
    .filter((group) => {
      return group.items.length > 0;
    });
};

export const homeTrustStrip = [
  {
    icon: TruckIcon,
    title: "Fulfillment",
    desc: "Structured catalog & inventory-ready model",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure pay",
    desc: "Encrypted payments and order confirmation",
  },
  {
    icon: CreditCardIcon,
    title: "Transparent",
    desc: "Prices in USD, tax where applicable",
  },
  {
    icon: HeadphonesIcon,
    title: "Human support",
    desc: "Order-scoped chat + optional video",
  },
];

export const HIGHLIGHTS = [
  "Secure checkout",
  "Support from order after payment",
  "Specs listed for this catalog",
];

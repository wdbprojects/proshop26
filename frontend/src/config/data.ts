import { routes } from "@/config/routes";
import {
  Bot,
  CreditCardIcon,
  Gauge,
  HeadphonesIcon,
  ImageUp,
  LifeBuoy,
  Settings2,
  ShieldCheckIcon,
  SquareTerminal,
  TruckIcon,
} from "lucide-react";

export const sidebarData = {
  navMain: [
    {
      id: 1,
      title: "Getting Started",
      url: "#",
      items: [
        {
          id: 1,
          title: "Dashboard",
          url: routes.dashboard,
          icon: Gauge,
        },
        { id: 2, title: "Rendering", url: "#", icon: Settings2 },
        { id: 3, title: "Optimizing", url: "#", icon: ImageUp },
      ],
    },
    {
      id: 2,
      title: "Getting Continued",
      url: "#",
      items: [
        { id: 1, title: "Data Fetching", url: "#", icon: LifeBuoy },
        { id: 2, title: "Rendering", url: "#", icon: Settings2 },
        { id: 3, title: "Optimizing", url: "#", icon: ImageUp },
      ],
    },
    {
      id: 3,
      title: "Getting Finished",
      url: "#",
      items: [
        { id: 1, title: "Data Fetching", url: "#", icon: SquareTerminal },
        { id: 2, title: "Rendering", url: "#", icon: Settings2 },
        { id: 3, title: "Optimizing", url: "#", icon: Bot },
      ],
    },
  ],
  user: {
    name: "Scarlett Johansson",
    email: "scarlett@hottt.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
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

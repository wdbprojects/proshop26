"use client";

import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const LocationMap = dynamic(
  () => import("@/modules/components/address/location-map-client"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
  },
);

export default LocationMap;

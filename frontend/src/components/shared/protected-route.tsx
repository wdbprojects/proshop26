"use client";

import { ReactNode, useEffect } from "react";
import { getSession } from "@/lib/auth-utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { Spinner } from "@/components/ui/spinner";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    retry: false,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
    enabled: true,
  });

  useEffect(() => {
    if (!isLoading && !data?.session) {
      router.push(routes.login);
    }
  }, [isLoading, data?.session, router]);

  if (isLoading)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner className="text-primary size-18" />
      </div>
    );
  if (!data?.session) return null;

  return <>{children}</>;
};

export default ProtectedRoute;

"use client";

import { ReactNode, useEffect } from "react";
import { UserRole } from "@/config/type-schemas";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { routes } from "@/config/routes";
import { Spinner } from "@/components/ui/spinner";

// No `allow` = any logged-in user. With `allow`, the role must be in the list

const RoleGuard = ({
  children,
  allow,
}: {
  children: ReactNode;
  allow?: UserRole[];
}) => {
  const router = useRouter();
  const { session, isLoading } = useSession();
  const role = session?.user?.role as UserRole | undefined;
  const allowed =
    Boolean(session) &&
    (!allow || (role !== undefined && allow.includes(role)));

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace(routes.login);
    } else if (!allowed) {
      router.replace(routes.dashboard);
    }
  }, [isLoading, session, allowed, router]);

  if (isLoading || !allowed) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="text-primary size-12" />
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;

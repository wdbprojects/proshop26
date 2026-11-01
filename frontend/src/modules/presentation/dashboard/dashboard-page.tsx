"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getNavForRole } from "@/config/data";
import { routes } from "@/config/routes";
import { UserRole } from "@/config/type-schemas";
import { useUser } from "@/hooks/use-session";
import Link from "next/link";

const DashboardPage = () => {
  const { user } = useUser();
  const role = (user?.role ?? "customer") as UserRole;

  const links = getNavForRole(role)
    .flatMap((group) => {
      return group.items;
    })
    .filter((item) => {
      return item.url !== routes.dashboard;
    });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>Signed in as</span>
          <Badge variant="secondary" className="capitalize">
            {role}
          </Badge>
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => {
          return (
            <Link key={item.id} href={item.url}>
              <Card className="hover:border-primary/45 border border-transparent transition hover:shadow-md">
                <CardContent className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                    <item.icon className="size-5" />
                  </div>
                  <span className="font-medium">{item.title}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardPage;

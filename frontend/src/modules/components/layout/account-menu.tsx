import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-session";
import { useSignOut } from "@/hooks/use-sign-out";
import LoginButton from "@/modules/components/auth/login-button";
import { initials } from "@/lib/utils";
import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { accountLinks } from "@/config/data";
import Link from "next/link";

const AccountMenu = () => {
  const { user, isLoading } = useUser();
  const signOut = useSignOut();

  if (isLoading) return <Skeleton className="h-7 w-24" />;
  if (!user) return <LoginButton variant="default" text="Log in" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="gap-2 px-2" />}
      >
        <Avatar size="sm">
          <AvatarImage src={user.image ?? ""} alt={user.name} />
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-28 truncate text-sm lg:inline">
          {user.name}
        </span>
        <ChevronDownIcon className="size-3.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
              <div className="grid flex-1 leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {accountLinks.map((item) => {
            return (
              <DropdownMenuItem
                key={item.id}
                className="cursor-pointer"
                render={<Link href={item.url} />}
              >
                <item.icon />
                {item.title}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            disabled={signOut.isPending}
            onClick={() => signOut.mutate()}
          >
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;

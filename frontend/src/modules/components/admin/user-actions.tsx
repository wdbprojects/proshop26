"use client";

import { IAdminUser, UserRole } from "@/config/type-schemas";
import { USER_ROLES } from "@/config/data";
import { useUser } from "@/hooks/use-session";
import { useUserActions } from "@/hooks/use-admin-users";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/shared/confirm-dialog";
import { Input } from "@/components/ui/input";

const labelOf = (role: UserRole) => {
  return (
    USER_ROLES.find((item) => {
      return item.value === role;
    })?.label ?? role
  );
};

const ROLE_HELP: Record<UserRole, string> = {
  customer: "",
  support: "",
  admin: "",
};

const UserActions = ({ user }: { user: IAdminUser }) => {
  const { user: me } = useUser();
  const { setRole, ban, unban } = useUserActions();
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [banOpen, setBanOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (me?.id === user.id) {
    return <span className="text-muted-foreground text-xs">You</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Select
        value={user.role}
        onValueChange={(value) => {
          const next = String(value) as UserRole;
          if (next !== user.role) setPendingRole(next);
        }}
      >
        <SelectTrigger size="sm" className="w-28">
          <SelectValue>{labelOf(user.role)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {USER_ROLES.map((item) => {
            return (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {user.banned ? (
        <Button
          size="sm"
          variant="outline"
          disabled={unban.isPending}
          onClick={() => unban.mutate(user.id)}
        >
          Unban
        </Button>
      ) : (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setBanOpen(true)}
        >
          Ban
        </Button>
      )}
      <ConfirmDialog
        open={pendingRole !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRole(null);
        }}
        title={`Change role to ${pendingRole ? labelOf(pendingRole) : ""}`}
        description={`${user.name} (${user.email}). ${pendingRole ? ROLE_HELP[pendingRole] : ""}`}
        confirmLabel="Change role"
        pending={setRole.isPending}
        onConfirm={() => {
          if (!pendingRole) return;
          setRole.mutate(
            { id: user.id, role: pendingRole },
            { onSuccess: () => setPendingRole(null) },
          );
        }}
      />

      <ConfirmDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        title="Ban this user?"
        description={`${user.name} (${user.email}) will be signed out everywhere and won't be able to log in. Their orders are kept.`}
        confirmLabel="Ban user"
        destructive
        pending={ban.isPending}
        onConfirm={() => {
          ban.mutate(
            {
              id: user.id,
              reason: reason.trim() || undefined,
            },
            {
              onSuccess: () => {
                setBanOpen(false);
                setReason("");
              },
            },
          );
        }}
      >
        <Input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason (optional, only staff see it)"
        />
      </ConfirmDialog>
    </div>
  );
};

export default UserActions;

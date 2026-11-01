"use client";

import { useSignOut } from "@/hooks/use-sign-out";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";

const SignOutButton = () => {
  const signOut = useSignOut();

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => signOut.mutate()}
      disabled={signOut.isPending}
    >
      {signOut.isPending ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="size-3.5 animate-spin" />
          <span>Pending...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <LogOut className="size-3.5" />
          <span>Log out</span>
        </div>
      )}
    </Button>
  );
};

export default SignOutButton;

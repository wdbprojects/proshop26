"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { routes } from "@/config/routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const signOutUser = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-out`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(
      result.message || result.error || "Sign out failed, please try again!",
    );
  }
  return result;
};
const SignOutButton = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // USE QUERY MUTATION
  const signOutMutation = useMutation({
    mutationFn: signOutUser,
    onSuccess: (data) => {
      queryClient.clear();
      toast.success(data.message || "Signed out successfully");
      router.push(routes.login);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      className=""
      onClick={handleSignOut}
      disabled={signOutMutation.isPending}
    >
      {signOutMutation.isPending ? (
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

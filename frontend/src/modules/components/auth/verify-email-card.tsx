"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { apiFetch } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const VerifyEmailCard = () => {
  const token = useSearchParams().get("token");
  const started = useRef(false);

  const mutation = useMutation({
    mutationFn: (value: string) => {
      return apiFetch<{ success: boolean; alreadyVerified?: boolean }>(
        "/api/auth/verify-email",
        {
          method: "POST",
          body: { token: value },
        },
      );
    },
  });

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    mutation.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const failed = !token || mutation.isError;

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        {mutation.isSuccess ? (
          <>
            <CheckCircle2Icon className="size-10 text-green-600" />
            <h1 className="text-xl font-bold">
              {mutation.data?.alreadyVerified
                ? "Email already verified"
                : "Email verified"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mutation.data?.alreadyVerified
                ? "You can log in with your account."
                : "Your account is ready."}
            </p>
            <Link href={routes.login} className="text-sm underline">
              Go to login
            </Link>
          </>
        ) : failed ? (
          <>
            <XCircleIcon className="text-destructive size-10" />
            <h1 className="text-xl font-bold">Link invalid or expired</h1>
            <p className="text-muted-foreground text-sm">
              Try logging in. We send a new verification link whenever an
              unverified account attempts to log in.
            </p>
            <Link href={routes.login} className="text-sm underline">
              Go to login
            </Link>
          </>
        ) : (
          <>
            <Spinner className="text-primary size-10" />
            <p className="text-muted-foreground text-sm">Verifying...</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VerifyEmailCard;

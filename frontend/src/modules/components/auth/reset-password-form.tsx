"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { apiFetch } from "@/lib/api";
import {
  resetPasswordSchema,
  ResetPasswordSchemaType,
} from "@/schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";

const ResetPasswordForm = () => {
  const router = useRouter();
  const token = useSearchParams().get("token");

  const { control, handleSubmit } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordSchemaType) => {
      return apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: { token: token, password: values.password },
      });
    },
    onSuccess: () => {
      toast.add({ type: "success", title: "Password updated, Please log in." });
      router.push(routes.login);
    },
    onError: (error: Error) =>
      toast.add({ type: "error", title: error.message }),
  });

  if (!token) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-3 p-6 text-center">
          <h1 className="text-xl font-bold">Invalid link</h1>
          <p className="text-muted-foreground text-sm">
            Tjis reset link is missing its token
          </p>
          <Link href={routes.forgotPassword} className="text-sm underline">
            Request a new link
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-6">
        <form
          onSubmit={handleSubmit((values) => {
            return mutation.mutate(values);
          })}
          className="space-y-4"
        >
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-bold">Choose a new password</h1>
            <p className="text-muted-foreground text-sm">
              At least 8 characters, with a letter and a number
            </p>
          </div>
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => {
              return (
                <Field className="gap-2">
                  <FieldLabel htmlFor="rp-password">New password</FieldLabel>
                  <Input
                    id="rp-password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError
                    errors={[fieldState.error]}
                    className="text-xs italic"
                  />
                </Field>
              );
            }}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState }) => {
              return (
                <Field className="gap-2">
                  <FieldLabel htmlFor="rp-password">
                    Confirm password
                  </FieldLabel>
                  <Input
                    id="rp-confirm"
                    type="password"
                    autoComplete="confirm-password"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError
                    errors={[fieldState.error]}
                    className="text-xs italic"
                  />
                </Field>
              );
            }}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Spinner /> : null}
            <span>Update password</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetPasswordForm;

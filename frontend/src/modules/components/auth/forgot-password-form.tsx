"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  forgotPasswordSchema,
  ForgotPasswordSchemaType,
} from "@/schemas/auth-schemas";
import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { MailCheckIcon } from "lucide-react";
import { routes } from "@/config/routes";
import Link from "next/link";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const ForgotPasswordForm = () => {
  const [sent, setSent] = useState(false);
  const { control, handleSubmit } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordSchemaType) => {
      return apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: values,
      });
    },
    onSuccess: () => setSent(true),
    onError: (error: Error) =>
      toast.add({ type: "error", title: error.message }),
  });

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="space-y-4 p-6">
        {sent ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <MailCheckIcon className="text-primary size-10" />
            <h1 className="text-xl font-bold">Check your email</h1>
            <p className="text-muted-foreground text-sm">
              If an account exists for that address, we sent a link to reset
              your password. It expires in one hour.
            </p>
            <Link href={routes.login} className="text-sm underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit((values) => {
              return mutation.mutate(values);
            })}
            className="space-y-4"
          >
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-bold">Forgot your password?</h1>
              <p className="text-muted-foreground text-sm">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => {
                return (
                  <Field className="gap-2">
                    <FieldLabel htmlFor="fp-email">Email</FieldLabel>
                    <Input
                      id="fp-email"
                      type="email"
                      placeholder="a@example.com"
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
              <span>Send a reset link</span>
            </Button>
            <div className="text-center">
              <Link
                href={routes.login}
                className="text-muted-foreground text-xs underline"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordForm;

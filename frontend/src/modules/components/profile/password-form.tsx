"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { useChangePassword } from "@/hooks/use-profile";
import {
  changePasswordSchema,
  ChangePasswordSchemaType,
} from "@/schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

type PasswordName = "currentPassword" | "newPassword" | "confirmPassword";

const PASSWORD_FIELDS: {
  name: PasswordName;
  label: string;
  autoComplete: string;
}[] = [
  {
    name: "currentPassword",
    label: "Current password",
    autoComplete: "current-password",
  },
  {
    name: "newPassword",
    label: "New password",
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Confirm new password",
    autoComplete: "new-password",
  },
];

const PasswordForm = ({ hasPassword }: { hasPassword: boolean }) => {
  const change = useChangePassword();
  const { control, handleSubmit, reset } = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (!hasPassword) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Your account signs in with Google, so it has no password yet. To add
            one,{" "}
            <Link href={routes.forgotPassword} className="underline">
              request a password reset link
            </Link>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const onSubmit = (values: ChangePasswordSchemaType) => {
    change.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      { onSuccess: () => reset() },
    );
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            At least 8 characters, with a letter and a number. Your other
            devices will be signed out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            {PASSWORD_FIELDS.map(({ name, label, autoComplete }) => {
              return (
                <Controller
                  key={name}
                  control={control}
                  name={name}
                  render={({ field, fieldState }) => {
                    return (
                      <Field
                        className="gap-2"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor={`pw-${name}`}>{label}</FieldLabel>
                        <Input
                          id={`pw-${name}`}
                          type="password"
                          autoComplete={autoComplete}
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
              );
            })}
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-4 justify-end">
          <Button type="submit" disabled={change.isPending}>
            {change.isPending && <Spinner />}
            <span>Update password</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PasswordForm;

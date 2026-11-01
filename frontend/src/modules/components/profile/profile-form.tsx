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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ProfileResponse } from "@/config/type-schemas";
import { useUpdateProfile } from "@/hooks/use-profile";
import { profileSchema, ProfileSchemaType } from "@/schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

const ProfileForm = ({ profile }: { profile: ProfileResponse["profile"] }) => {
  const update = useUpdateProfile();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ProfileSchemaType>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile.name },
  });

  const onSubmit = (values: ProfileSchemaType) => {
    // reset to the saved value so the Save button disables again
    update.mutate(values, { onSuccess: () => reset(values) });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            How your name appears on your orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => {
                return (
                  <Field className="gap-2" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-name">Name</FieldLabel>
                    <Input
                      id="profile-name"
                      autoComplete="name"
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
            <Field className="gap-2">
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input
                id="profile-email"
                value={profile.email}
                disabled
                readOnly
              />
              <FieldDescription>
                Your email can&apos;t be changed
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-4 justify-end">
          <Button type="submit" disabled={!isDirty || update.isPending}>
            {update.isPending && <Spinner />}
            <span>Save changes</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileForm;

"use client";

import { ComponentProps, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "@/schemas/auth-schemas";
import Image from "next/image";
import Link from "next/link";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import GoogleButton from "@/modules/components/auth/google-button";
import { useSearchParams } from "next/navigation";

/* Login Mutation Function */
const loginUser = async (data: LoginSchemaType) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in/email`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  const result = await response.json();
  if (!response.ok || !result.success) {
    const error = new Error(
      result.message || result.error || "Login failed, try again later!!!",
    ) as Error & { code?: string };
    error.code = result.code;
    throw error;
  }
  return result;
};

const LoginForm = ({ className, ...props }: ComponentProps<"div">) => {
  const router = useRouter();
  const oauthError = useSearchParams().get("error");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const resendMutation = useMutation({
    mutationFn: (email: string) => {
      return apiFetch("/api/auth/resend-verification", {
        method: "POST",
        body: { email },
      });
    },
    onSuccess: () => {
      toast.add({ type: "success", title: "Verification email sent" });
    },
  });

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { handleSubmit, control, reset } = form;

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      toast.add({
        type: "success",
        title: data.message || "Login successful!",
      });
      reset();
      router.push(routes.home);
    },
    onError: (error: Error & { code?: string }, variables) => {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(variables.email);
        return;
      }
      toast.add({ type: "error", title: "Error", description: error.message });
    },
  });

  const onSubmit = (data: LoginSchemaType) => {
    loginMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* LEFT SIDE */}
          <form
            id="login-user"
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 md:p-8"
          >
            <FieldGroup className="gap-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to login to your account
                </p>
              </div>

              {/* EMAIL */}
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => {
                  return (
                    <Field className="gap-2">
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="text"
                        placeholder="a@example.com"
                        autoComplete="off"
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

              {/* PASSWORD */}
              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => {
                  return (
                    <Field className="gap-2">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Your password here"
                        autoComplete="off"
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      <div className="flex justify-end">
                        <Link
                          href={routes.forgotPassword}
                          className="text-muted-foreground text-xs underline-offset-4 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs italic"
                      />
                    </Field>
                  );
                }}
              />

              {unverifiedEmail && (
                <Alert>
                  <AlertTitle>Verify your email first</AlertTitle>
                  <AlertDescription>
                    We sent a link to {unverifiedEmail}. Check your inbox (and
                    spam), then log in.{" "}
                    <Button
                      type="button"
                      className="underline"
                      variant="link"
                      disabled={resendMutation.isPending}
                      onClick={() => {
                        resendMutation.mutate(unverifiedEmail);
                      }}
                    >
                      Resend the email
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {oauthError && (
                <Alert variant="destructive">
                  <AlertTitle>Google login didn&apos;t complete</AlertTitle>
                  <AlertDescription>
                    Try again, or log in with your email and password
                  </AlertDescription>
                </Alert>
              )}

              {/* ACTION BUTTONS */}
              <FieldGroup className="mt-4 flex w-full flex-col items-center justify-between gap-0!">
                <Button
                  variant="default"
                  size="default"
                  className="w-full"
                  type="submit"
                  form="login-user"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Pending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <LogIn className="size-3.5" />
                      <span className="font-semibold">Login</span>
                    </div>
                  )}
                </Button>
                <div className="flex w-full justify-end">
                  <Button
                    size="sm"
                    className="text-xs"
                    type="button"
                    variant="link"
                    disabled={loginMutation.isPending}
                    onClick={() => {
                      reset();
                    }}
                  >
                    Reset Form
                  </Button>
                </div>
              </FieldGroup>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                or continue with
              </FieldSeparator>
              <Field className="my-4 grid grid-cols-2 gap-4">
                <GoogleButton />
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Sign up with Facebook</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Button variant="link" size="sm">
                  <Link href={routes.register} className="font-semibold">
                    Register
                  </Link>
                </Button>
              </FieldDescription>
            </FieldGroup>
          </form>
          {/* RIGHT SIDE */}
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/login-bg.jpg"
              width={1000}
              height={1000}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              placeholder="blur"
              blurDataURL="/placeholder.svg"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link href="#">Terms of Service</Link> and{" "}
        <Link href="#">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
};

export default LoginForm;

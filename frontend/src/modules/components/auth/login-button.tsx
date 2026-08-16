"use client";

import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { LogIn } from "lucide-react";
import Link from "next/link";
import React from "react";

const LoginButton = ({
  variant = "secondary",
  text = "Login",
}: {
  variant:
    | "secondary"
    | "link"
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | null
    | undefined;
  text?: string;
}) => {
  return (
    <Link
      href={routes.login}
      className={buttonVariants({
        size: "sm",
        variant: variant,
        className: "flex items-center justify-center gap-2",
      })}
    >
      <LogIn className="size-3.5" />
      <span>{text}</span>
    </Link>
  );
};

export default LoginButton;

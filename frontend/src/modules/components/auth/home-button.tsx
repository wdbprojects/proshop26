"use client";

import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";

const HomeButton = () => {
  return (
    <Link
      href={routes.home}
      className={buttonVariants({
        size: "sm",
        variant: "outline",
        className: "absolute top-4 left-4 text-xs",
      })}
    >
      <ArrowBigLeft className="size-3" />
      <span>Home</span>
    </Link>
  );
};

export default HomeButton;

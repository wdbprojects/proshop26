import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { HeadphonesIcon, TruckIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const FooterMain = () => {
  return (
    <div className="bg-muted/20 z-50 h-auto w-full border-t px-4 py-6">
      <div className="container mx-auto">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="text-base-content flex items-center gap-2 font-semibold">
              <TruckIcon className="text-primary size-8" aria-hidden />
              Ecommerce26
            </div>
            <p className="text-base-content/65 text-muted-foreground mt-3 text-sm leading-relaxed">
              Curated hardware and workspace tools. Paid orders include priority
              support; chat with our team and join a video call when we share a
              link.
            </p>
          </div>

          <div>
            <h3 className="text-base-content/50 text-center text-xs font-semibold tracking-wider uppercase">
              Shop
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href={routes.home}
                  className={`link link-hover text-base-content/80 w-full ${buttonVariants(
                    {
                      size: "sm",
                      variant: "ghost",
                    },
                  )}`}
                >
                  All products
                </Link>
              </li>
              <li>
                <Link
                  href={routes.cart}
                  className={`link link-hover text-base-content/80 w-full ${buttonVariants(
                    {
                      size: "sm",
                      variant: "ghost",
                    },
                  )}`}
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href={routes.orders}
                  className={`link link-hover text-base-content/80 w-full ${buttonVariants(
                    {
                      size: "sm",
                      variant: "ghost",
                    },
                  )}`}
                >
                  Orders
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text text-xs font-semibold tracking-wider uppercase">
              Support
            </h3>
            <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <HeadphonesIcon
                  className="text-primary mt-0.5 size-5 shrink-0"
                  aria-hidden
                />
                <span>
                  Order-scoped chat after payment; video links shared in-thread.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
              Company
            </h3>
            <p className="text-muted-foreground mt-3 text-sm">
              Built for teams who care about clear specs, fast fulfillment, and
              human support when it matters.
            </p>
          </div>
        </div>
        <div className="border-base-300 mt-10 space-y-4 border-t pt-6">
          <p className="text-muted-foreground text-center text-xs">
            © {new Date().getFullYear()} Ecommerce26 · All prices in USD
          </p>
        </div>
      </div>
    </div>
  );
};

export default FooterMain;

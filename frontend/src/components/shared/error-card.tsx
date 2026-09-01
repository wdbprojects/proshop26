import { Card, CardAction, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { routes } from "@/config/routes";

const ErrorCard = () => {
  return (
    <div className="my-16 flex w-full items-center justify-center">
      <Card className="flex min-h-50 w-full max-w-md items-center justify-center">
        <CardContent>
          <h2 className="text-destructive text-2xl font-semibold">
            Error retrieving data
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Sometimes unknown errors happen that are not in our hands. Please
            try again or follow the links below.
          </p>
        </CardContent>
        <CardAction className="flex w-full items-center justify-between gap-4 px-4">
          <Link
            href={routes.home}
            className={cn(
              "w-full flex-1",
              buttonVariants({ size: "sm", variant: "default" }),
            )}
          >
            Browse Catalog
          </Link>
          <Link
            href={routes.orders}
            className={cn(
              "w-full flex-1",
              buttonVariants({ size: "sm", variant: "secondary" }),
            )}
          >
            View Orders
          </Link>
        </CardAction>
      </Card>
    </div>
  );
};

export default ErrorCard;

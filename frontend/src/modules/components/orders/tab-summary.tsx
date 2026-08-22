import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/config/routes";
import { IOrderItem } from "@/config/types";
import { OrderDetailsResponse } from "@/config/type-schemas";
import { IK_PRESETS, imageKitOptimizedUrl } from "@/lib/image-kit-url";
import { formatPrice } from "@/lib/utils";
import { ListOrderedIcon, PackageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const TabSummary = ({
  order,
  items,
}: {
  order: Pick<OrderDetailsResponse, "singleOrder">;
  items: IOrderItem[];
}) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-start gap-2">
          <ListOrderedIcon className="text-primary size-5" />
          <span className="text-xl font-medium">Line items</span>
        </CardTitle>
        <CardDescription>
          {items.length} {items.length === 1 ? "product" : "products"} in this
          order
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        <ul>
          {items.map((row) => {
            return (
              <li key={row.id} className="px-4 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <div className="flex flex-1 gap-4">
                    <Link
                      href={routes.productDetails(row.product.slug)}
                      className="group border-muted/30 ring-muted/30 hover:ring-primary/40 relative shrink-0 overflow-hidden rounded-xl border shadow-sm ring-1 transition"
                    >
                      <div className="h-24 w-24 sm:h-28 sm:w-28">
                        {row.product.imageUrl ? (
                          <Image
                            src={imageKitOptimizedUrl(
                              row.product.imageUrl,
                              IK_PRESETS.orderLineThumb,
                            )}
                            alt=""
                            width={100}
                            height={100}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="from-muted to-muted-foreground flex h-full items-center justify-center bg-linear-to-br">
                            <PackageIcon
                              className="text-foreground/30 size-10"
                              aria-hidden
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={routes.productDetails(row.product.slug)}
                        className="text-foreground text-lg leading-snug font-semibold"
                      >
                        {row.product.name}
                      </Link>
                      {row.product.category ? (
                        <p className="text-foreground/55 mt-1 text-sm">
                          {row.product.category}
                        </p>
                      ) : null}
                      <div className="text-foreground/65 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span>Qty {row.quantity}</span>
                        <span className="text-foreground/40">-</span>
                        <span>
                          {formatPrice(
                            row.unitPriceCents,
                            row.product.currency,
                          )}{" "}
                          each
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-accent/30 flex shrink-0 flex-col border-t pt-3 sm:border-t-0 sm:pt-0 sm:text-right">
                    <span className="text-foreground/45 text-xs font-medium tracking-wide uppercase">
                      Subtotal
                    </span>
                    <span className="text-foreground text-xl font-bold tabular-nums">
                      {formatPrice(
                        row.unitPriceCents * row.quantity,
                        row.product.currency,
                      )}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-foreground/50 flex items-center justify-between gap-4 border-t px-5 py-5 sm:px-6">
          <span className="text-foreground text-lg font-semibold">Total</span>
          <span className="text-primary text-2xl font-bold tabular-nums">
            {formatPrice(order?.singleOrder?.totalCents, "usd")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TabSummary;

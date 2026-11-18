"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { CART_QUERY_KEY } from "@/hooks/use-cart-query";
import { useQrStatus } from "@/hooks/use-qr-status";
import { cn, formatPrice } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ClockIcon,
  DownloadIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

// ms left until `expiresAt`, updated every second
const useCountdown = (expiresAt: string | null) => {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [expiresAt]);

  return remaining;
};

const formatClock = (ms: number) => {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const QrPayment = ({
  qrId,
  onRestart,
}: {
  qrId: string;
  onRestart: () => void;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQrStatus(qrId);
  const remaining = useCountdown(
    data?.status === "pending" ? data.expiresAt : null,
  );

  // "" = paid but the order id wasn't resolved yet; null = not paid
  const paidOrderId = data?.status === "paid" ? (data.orderId ?? "") : null;

  useEffect(() => {
    if (paidOrderId === null) return;
    queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    router.replace(paidOrderId ? routes.orderItem(paidOrderId) : routes.orders);
  }, [paidOrderId, queryClient, router]);

  const shell = (children: ReactNode) => {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          {children}
        </CardContent>
      </Card>
    );
  };
  if (isLoading) {
    return shell(<Spinner className="text-primary size-10" />);
  }
  if (isError || !data) {
    return shell(
      <>
        <TriangleAlertIcon className="text-destructive size-10" />
        <h1 className="text-xl font-bold">
          We couldn&apos;t load this payment
        </h1>
        <p className="text-muted-foreground text-sm">
          If you already paid, your order will appear in your orders list. Do
          not pay again.
        </p>
        <Button onClick={onRestart}>Back to checkout</Button>
      </>,
    );
  }
  if (data.status === "paid") {
    return shell(
      <>
        <CheckCircle2 className="size-12 text-green-600" />
        <h1 className="text-xl font-bold">Payment received</h1>
        <p className="text-muted-foreground text-sm">
          Taking you to your order...
        </p>
      </>,
    );
  }
  if (data.status === "expired") {
    return shell(
      <>
        <ClockIcon className="text-muted-foreground size-10" />
        <h1 className="text-xl font-bold">This QR expired</h1>
        <p className="text-muted-foreground text-sm">
          Nothing was charged. Generate a new QR to try again.
        </p>
        <Button onClick={onRestart}>Generate a new QR</Button>
      </>,
    );
  }
  if (data.status === "error") {
    return shell(
      <>
        <TriangleAlertIcon className="size-10 text-amber-500" />
        <h1 className="text-xl font-bold">We need to review this payment</h1>
        <p className="text-muted-foreground text-sm">
          We couldn&apos;t confirm it automatically. If you already paid, do not
          pay again: contact support and mention reference{" "}
          <span className="font-mono">{qrId}</span>
        </p>
        <Button variant="outline" onClick={onRestart}>
          Back to checkout
        </Button>
      </>,
    );
  }

  // pending
  const src = data.qrImage
    ? data.qrImage.startsWith("data:")
      ? data.qrImage
      : `data:image/png;base64,${data.qrImage}`
    : null;

  return shell(
    <>
      <h1 className="text-xl font-bold">Pay with QR</h1>
      <p className="text-3xl font-semibold tabular-nums">
        {formatPrice(data.totalCents, data.currency)}
      </p>

      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Payment QR code"
            className="size-64 rounded-xl bg-white p-3"
          />
          <a
            href={src}
            download="payment-qr.png"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "flex items-center gap-2",
            )}
          >
            <DownloadIcon className="size-4" />
            <span>Save QR image</span>
          </a>
        </>
      ) : (
        <Spinner className="text-primary size-10" />
      )}

      <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-left text-sm">
        <li>Open your bank&apos;s app and choose &ldquo;Pay with QR&rdquo;.</li>
        <li>
          Scan this code, or upload the saved image if you&apos;re on your
          phone.
        </li>
        <li>Confirm the amount. This page updates by itself.</li>
      </ol>

      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Spinner className="size-4" />
        <span>
          Waiting for your payment{" "}
          {remaining !== null && ` - expires in ${formatClock(remaining)}`}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={onRestart}>
        Back to checkout
      </Button>
    </>,
  );
};

export default QrPayment;

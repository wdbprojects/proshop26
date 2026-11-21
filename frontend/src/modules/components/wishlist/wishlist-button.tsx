"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { routes } from "@/config/routes";
import { useUser } from "@/hooks/use-session";
import { useToggleWishlist, useWishlistIds } from "@/hooks/use-wishlist";
import { cn } from "cn";
import { HeartIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const WishlistButton = ({
  productId,
  variant = "icon",
  className,
}: {
  productId: string;
  variant?: "icon" | "full";
  className?: string;
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUser();
  const { has } = useWishlistIds();
  const toggle = useToggleWishlist();
  const saved = has(productId);

  const handleClick = () => {
    if (isLoading) return;
    if (!isAuthenticated) {
      toast.add({
        type: "info",
        title: "Log in to save products",
        description: "Your wishlist is kept in your account",
        actionProps: {
          children: "Log in",
          onClick() {
            router.push(routes.login);
          },
        },
      });
      return;
    }
    toggle.mutate({ productId: productId, save: !saved });
  };
  const label = saved ? "Remove from wishlist" : "Add to wishlist";

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant="outline"
        aria-pressed={saved}
        className={className}
        onClick={handleClick}
      >
        <HeartIcon
          className={cn("size-4", saved && "fill-red-600 text-red-600")}
        />
        <span>{saved ? "Saved to wishlist" : "Save to wishlist"}</span>
      </Button>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      title={label}
      onClick={handleClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105 active:scale-95",
        className,
      )}
    >
      <HeartIcon
        className={cn(
          "size-5",
          saved
            ? "fill-destructive text-destructive dark:fill-red-600 dark:text-red-600"
            : "text-neutral-700",
        )}
      />
    </button>
  );
};

export default WishlistButton;

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductImageType } from "@/config/type-schemas";
import { IK_PRESETS, imageKitOptimizedUrl } from "@/lib/image-kit-url";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

const ImageLightbox = ({
  images,
  index,
  onIndexChange,
  open,
  onOpenChange,
  name,
}: {
  images: ProductImageType[];
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
}) => {
  const count = images.length;
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!open || count < 2) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onIndexChange((index - 1) % count);
      if (event.key === "ArrowRight") onIndexChange((index + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, count, onIndexChange]);

  const current = images[index];
  if (!current) return null;

  const go = (step: number) => {
    onIndexChange((index + step + count) % count);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90svh] max-w-[calc(100%-1rem)] gap-0 bg-black/95 p-0 text-white sm:max-w-5xl">
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <DialogDescription className="sr-only">
          Image {index + 1} of {count}
        </DialogDescription>

        <div
          className="relative h-full w-full"
          onTouchStart={(event) => {
            return (touchStartX.current = event.touches[0].clientX);
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null || count < 2) return;
            const delta = event.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
          }}
        >
          <Image
            src={imageKitOptimizedUrl(current.url, IK_PRESETS.lightbox) ?? ""}
            alt={current.alt || name}
            fill
            sizes="100w"
            className="object-contain"
          />
        </div>
        {count > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon-lg"
              aria-label="Previous image"
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full"
              onClick={() => go(-1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="secondary"
              size="icon-lg"
              aria-label="Next image"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full"
              onClick={() => go(1)}
            >
              <ChevronRightIcon />
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageLightbox;

"use client";

import { useState } from "react";
import { ProductImageType } from "@/config/type-schemas";
import { PackageIcon, ZoomInIcon } from "lucide-react";
import Image from "next/image";
import { IK_PRESETS, imageKitOptimizedUrl } from "@/lib/image-kit-url";
import { cn } from "cn";
import ImageLightbox from "./image-lightbox";

const ProductGallery = ({
  images,
  name,
}: {
  images: ProductImageType[];
  name: string;
}) => {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const current = images[Math.min(active, images.length - 1)];

  if (!current) {
    return (
      <div className="bg-muted flex aspect-square w-full items-center justify-center rounded-md">
        <PackageIcon className="text-muted-foreground size-16" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Enlarge image"
        className="group bg-background relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-md border"
      >
        <Image
          src={imageKitOptimizedUrl(current.url, IK_PRESETS.productHero) ?? ""}
          alt={current.alt || name}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          priority
          className="object-contain"
        />
        <span>
          <ZoomInIcon className="size-3.5" />
          Click to enlarge
        </span>
      </button>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            return (
              <button
                key={image.id}
                type="button"
                aria-label={`Show image ${index + 1}`}
                aria-current={index === active}
                onClick={() => setActive(index)}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  "bg-background relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition",
                  index === active
                    ? "border-primary"
                    : "hover:border-primary/50 border-transparent",
                )}
              >
                <Image
                  src={
                    imageKitOptimizedUrl(image.url, IK_PRESETS.cartThumb) ?? ""
                  }
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </button>
            );
          })}
        </div>
      )}

      <ImageLightbox
        images={images}
        index={Math.min(active, images.length - 1)}
        onIndexChange={setActive}
        open={open}
        onOpenChange={setOpen}
        name={name}
      />
    </div>
  );
};

export default ProductGallery;

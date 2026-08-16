import { IOrderPreview } from "@/config/types";
import { IK_PRESETS, imageKitOptimizedUrl } from "@/lib/image-kit-url";
import { cn } from "@/lib/utils";
import { PackageIcon } from "lucide-react";
import Image from "next/image";

const SIZES = {
  md: "h-[5.5rem] w-[5.5rem]",
  lg: "h-32 w-32 sm:h-36 sm:w-36",
};

type Size = "md" | "lg";

const OrderPreview = ({
  previewItems,
  size = "md",
}: {
  previewItems: IOrderPreview[];
  size?: Size;
}) => {
  const box = SIZES[size] ?? SIZES.md;
  const ikPreset =
    size === "lg" ? IK_PRESETS.orderPreviewLg : IK_PRESETS.orderPreviewMd;

  if (!previewItems.length) {
    return (
      <div>
        <PackageIcon
          className={
            size === "lg"
              ? "text-muted-foreground/85 size-12"
              : "text-muted-foreground/85 size-8"
          }
          aria-hidden
        />
      </div>
    );
  }

  if (previewItems.length === 1) {
    const prevItem = previewItems[0];
    return (
      <div
        className={cn(
          "border-card bg-muted-background ring-foreground/40 relative shrink-0 overflow-hidden rounded-2xl border shadow-md ring-1",
          box,
        )}
      >
        {prevItem.imageUrl ? (
          <Image
            src={imageKitOptimizedUrl(prevItem.imageUrl, ikPreset)}
            alt=""
            width={100}
            height={100}
            className="h-full w-full object-cover"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-green-300 to-green-200">
            <PackageIcon
              aria-hidden
              className={
                size === "lg"
                  ? "text-muted-foreground/50 size-12"
                  : "text-muted-foreground/50 size-8"
              }
            />
          </div>
        )}
      </div>
    );
  }

  const cap = 4;
  const show = previewItems.slice(0, cap);
  const rest = previewItems.length > cap ? previewItems.length - cap : 0;

  return (
    <div
      className={cn(
        "bg-card grid shrink-0 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-2xl p-0.5 shadow-md",
        box,
      )}
    >
      {show.map((pic, index) => {
        return (
          <div
            key={`${pic.slug}-${index}`}
            className="bg-muted relative min-h-0 overflow-hidden rounded-md"
          >
            {pic.imageUrl ? (
              <Image
                src={imageKitOptimizedUrl(pic.imageUrl, ikPreset)}
                alt=""
                width={100}
                height={100}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full min-h-8 w-full items-center justify-center">
                <PackageIcon
                  className="text-muted-foreground size-4"
                  aria-hidden
                />
              </div>
            )}
            {index === cap - 1 && rest > 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 text-sm font-bold text-neutral-500 tabular-nums">
                +{rest}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default OrderPreview;

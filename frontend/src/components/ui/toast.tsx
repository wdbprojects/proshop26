"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  XIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

// One place mapping toast type -> color treatment. Add/adjust entries
// here going forward instead of hunting through the component tree —
// this is the only spot that needs to change for a new type or a color
// tweak.
//
// Palette follows HeroUI's semantic variants (accent blue, success green,
// warning amber, danger red). The toast background is intentionally NOT set
// here: every type keeps the theme's `bg-popover`, and color only shows up
// in the border and the icon. `root` goes on the toast, `icon` on the
// indicator. Light uses slightly deeper shades on green/amber so the icon
// keeps enough contrast on a light surface.
const TOAST_TYPE_STYLES: Record<string, { root: string; icon: string }> = {
  success: {
    root: "border-green-500/30 dark:border-green-400/30",
    icon: "text-green-600 dark:text-green-400",
  },
  error: {
    root: "border-destructive/30",
    icon: "text-destructive",
  },
  warning: {
    root: "border-amber-500/30 dark:border-amber-400/30",
    icon: "text-amber-600 dark:text-amber-400",
  },
  info: {
    root: "border-blue-500/30 dark:border-blue-400/30",
    icon: "text-blue-500 dark:text-blue-400",
  },
  loading: {
    root: "",
    icon: "text-blue-500 dark:text-blue-400",
  },
};

type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

// Which screen edge the stack grows from.
type ToastSide = "top" | "bottom";

function getToastSide(position: ToastPosition): ToastSide {
  return position.startsWith("top") ? "top" : "bottom";
}

// Viewport placement per position. On mobile every position collapses to a
// full-width strip centered on the chosen edge (inset-x-4 + mx-auto in
// ToastViewport); the sm: classes only kick in on larger screens.
const TOAST_VIEWPORT_POSITION_STYLES: Record<ToastPosition, string> = {
  "top-left": "top-4 sm:right-auto sm:left-4 sm:mx-0 sm:w-full",
  "top-center": "top-4",
  "top-right": "top-4 sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
  "bottom-left": "bottom-4 sm:right-auto sm:left-4 sm:mx-0 sm:w-full",
  "bottom-center": "bottom-4",
  "bottom-right": "bottom-4 sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
};

// Everything on the toast itself that depends on which edge it is anchored
// to. --dir is -1 when the stack grows upward from the bottom edge and 1 when
// it grows downward from the top edge; the stacking and enter/exit transforms
// in <Toast> multiply by it, so they are written once for both sides.
const TOAST_SIDE_STYLES: Record<ToastSide, string> = {
  bottom: "bottom-0 origin-bottom [--dir:-1] after:top-full",
  top: "top-0 origin-top [--dir:1] after:bottom-full",
};

// Swipe-to-dismiss goes toward the nearest edge: vertically off the anchored
// edge, and sideways toward the corner (or either way when centered).
const TOAST_SWIPE_DIRECTIONS: Record<
  ToastPosition,
  ("up" | "down" | "left" | "right")[]
> = {
  "top-left": ["up", "left"],
  "top-center": ["up", "left", "right"],
  "top-right": ["up", "right"],
  "bottom-left": ["down", "left"],
  "bottom-center": ["down", "left", "right"],
  "bottom-right": ["down", "right"],
};

const toast = ToastPrimitive.createToastManager();

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({
  className,
  position = "bottom-right",
  ...props
}: ToastPrimitive.Viewport.Props & { position?: ToastPosition }) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 z-50 mx-auto w-auto max-w-sm outline-none",
        TOAST_VIEWPORT_POSITION_STYLES[position],
        className,
      )}
      {...props}
    />
  );
}

function Toast({
  className,
  side = "bottom",
  ...props
}: ToastPrimitive.Root.Props & { side?: ToastSide }) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast bg-popover text-popover-foreground focus-visible:border-ring focus-visible:ring-ring/50 pointer-events-auto absolute right-0 z-[calc(1000-var(--toast-index))] w-full rounded-2xl border shadow-lg will-change-transform outline-none select-none focus-visible:ring-[3px]",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*var(--dir)+calc(var(--toast-index)*var(--gap)*var(--dir))+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--dir)*var(--toast-index)*var(--peek))+(var(--dir)*var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(calc(var(--dir)*-150%))]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(calc(var(--dir)*-150%))]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        TOAST_SIDE_STYLES[side],
        className,
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden px-4 py-2 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function ToastAction({
  className,
  render = <Button variant="default" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "text-muted-foreground hover:text-foreground relative shrink-0 after:absolute after:-inset-2 after:content-['']",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null;
  const iconColor = TOAST_TYPE_STYLES[type ?? ""]?.icon;

  if (type === "success") {
    icon = <CircleCheckIcon className={iconColor} aria-hidden="true" />;
  }

  if (type === "info") {
    icon = <InfoIcon className={iconColor} aria-hidden="true" />;
  }

  if (type === "warning") {
    icon = <TriangleAlertIcon className={iconColor} aria-hidden="true" />;
  }

  if (type === "error") {
    icon = <OctagonXIcon className={iconColor} aria-hidden="true" />;
  }

  if (type === "loading") {
    icon = (
      <Loader2Icon
        className={cn("animate-spin", iconColor)}
        aria-hidden="true"
      />
    );
  }

  if (!icon) {
    return null;
  }

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
    >
      {icon}
    </span>
  );
}

function ToastList({ position }: { position: ToastPosition }) {
  const { toasts } = ToastPrimitive.useToastManager();
  const side = getToastSide(position);

  return toasts.map((toastItem) => (
    <Toast
      key={toastItem.id}
      toast={toastItem}
      side={side}
      swipeDirection={TOAST_SWIPE_DIRECTIONS[position]}
      className={cn(
        TOAST_TYPE_STYLES[toastItem.type ?? ""]?.root,
        // Per-call override/extension. Pass this from any toast.add(...)
        // call anywhere in the app, e.g.:
        //   toast.add({ type: "success", title: "...", className: "border-4 border-pink-500" })
        // cn() (tailwind-merge aware) makes sure a conflicting utility
        // here wins over the type default rather than both applying.
        (toastItem as { className?: string }).className,
      )}
    >
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function Toaster({
  children,
  toastManager = toast,
  position = "bottom-right",
  viewportClassName,
  ...props
}: ToastPrimitive.Provider.Props & {
  /** Where the stack sits on screen. Defaults to "bottom-right". */
  position?: ToastPosition;
  viewportClassName?: string;
}) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport position={position} className={viewportClassName}>
          <ToastList position={position} />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export type { ToastPosition, ToastSide };

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
};

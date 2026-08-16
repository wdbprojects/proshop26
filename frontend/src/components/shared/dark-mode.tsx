"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const DarkMode = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center gap-2 space-x-2",
        className,
      )}
    >
      <Switch
        className="cursor-pointer"
        id="switch-theme"
        checked={theme === "dark"}
        onCheckedChange={() => {
          setTheme(theme === "dark" ? "light" : "dark");
        }}
      />
    </div>
  );
};

export default DarkMode;

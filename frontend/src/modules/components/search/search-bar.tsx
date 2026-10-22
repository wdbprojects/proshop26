"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { useProductSuggestions } from "@/hooks/use-product-suggestions";
import { PackageIcon, SearchIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { cn } from "cn";
import { IK_PRESETS, imageKitOptimizedUrl } from "@/lib/image-kit-url";
import { formatPrice } from "@/lib/utils";

const SearchBar = () => {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, isFetching, enabled } = useProductSuggestions(value);

  // close the dropdown when clicking outside
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const goToResults = () => {
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    router.push(`${routes.products}?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => {
        return Math.min(i + 1, suggestions.length - 1);
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => {
        return Math.max(i - 1, -1);
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      const active = suggestions[activeIndex];
      if (active) {
        setOpen(false);
        router.push(routes.productDetails(active.slug));
      } else {
        goToResults();
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && enabled;

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setActiveIndex(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search products..."
        className="pl-8"
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls="search-suggestions"
      />
      {isFetching && (
        <Spinner className="text-muted-foreground absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
      )}

      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="bg-popover absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-2xl border shadow-lg"
        >
          {suggestions.length === 0 && !isFetching ? (
            <p className="text-muted-foreground px-4 py-3 text-sm">
              No matches for &quot;{value.trim()}&quot;
            </p>
          ) : (
            <ul>
              {suggestions.map((item, index) => {
                return (
                  <li key={item.id}>
                    <Link
                      href={routes.productDetails(item.slug)}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2",
                        index === activeIndex ? "bg-accent/10" : "",
                      )}
                    >
                      <div className="bg-muted size-10 shrink-0 overflow-hidden rounded-md">
                        {item?.thumbnail ? (
                          <Image
                            src={imageKitOptimizedUrl(
                              item.thumbnail,
                              IK_PRESETS.adminThumb,
                            )}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PackageIcon className="text-muted-foreground m-2.5 size-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {item.shortDescription}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatPrice(item.priceCents, item.currency)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

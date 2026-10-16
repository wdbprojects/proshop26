"use client";

import { SORT_OPTIONS } from "@/hooks/use-products-catalog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortSelectProps {
  sort: string;
  setSort: (value: string) => void;
  hasSearch: boolean;
}

const SortSelect = ({ sort, setSort, hasSearch }: SortSelectProps) => {
  const options = SORT_OPTIONS.filter((option) => {
    return option.value !== "relevance" || hasSearch;
  });
  const selected = options.find((option) => {
    return option.value === sort;
  });

  return (
    <div className="flex flex-col gap-1">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Sorting Options</h3>
      </div>
      <Select
        value={sort}
        onValueChange={(value) => {
          setSort(String(value));
        }}
      >
        <SelectTrigger className="w-full" size="sm">
          <SelectValue placeholder="Sort by" className="p-0 text-xs">
            {selected?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="flex flex-col justify-center p-2 text-xs">
          {options.map((option) => {
            return (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-xs"
              >
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortSelect;

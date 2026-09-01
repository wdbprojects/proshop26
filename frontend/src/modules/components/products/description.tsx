"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { ChevronsUpDown } from "lucide-react";

const LongDescription = ({ longDescription }: { longDescription: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mx-0 mt-2 mb-2 w-full rounded border bg-white px-0 pr-1 transition-all dark:bg-neutral-900">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2 transition"
      >
        <div className="flex w-full items-center justify-between">
          <h3 className="px-2 py-1 text-lg font-semibold">Description</h3>
          <CollapsibleTrigger className="flex items-center justify-end rounded px-2 py-1 transition-all hover:bg-black/10 dark:hover:bg-black/40">
            <span className="text-muted-foreground mr-2 text-sm">
              {isOpen ? "Close" : "Open"}
            </span>
            <ChevronsUpDown className="text-muted-foreground h-4 w-4" />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="px-2 pb-2">
          <p className="text-muted-foreground text-sm">{longDescription}</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default LongDescription;

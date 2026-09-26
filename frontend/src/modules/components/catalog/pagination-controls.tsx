import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const PaginationControls = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  // if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex items-center justify-center gap-2"
      >
        <ChevronLeftIcon className="size-4" aria-hidden />
        <span>Prev</span>
      </Button>
      <span className="text-muted-foreground px-2 text-sm tabular-nums">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex items-center justify-center gap-2"
      >
        <span>Next</span>
        <ChevronRightIcon className="size-4" aria-hidden />
      </Button>
    </div>
  );
};

export default PaginationControls;

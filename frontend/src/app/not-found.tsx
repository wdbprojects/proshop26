import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { routes } from "@/config/routes";
import { FolderCode } from "lucide-react";
import Link from "next/link";

const LoadingPage = async () => {
  return (
    <Empty className="flex min-h-svh flex-col items-center justify-center">
      <EmptyHeader className="space-y-4">
        <EmptyMedia variant="icon" className="mb-4">
          <FolderCode />
        </EmptyMedia>
        <EmptyTitle className="text-2xl">404: Treasure Not Found.</EmptyTitle>
        <EmptyDescription className="text-base">
          This page has wandered off our map. Let’s get you back to civilization
          with a helpful link.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="mt-4 flex-row justify-center gap-2">
        <Button>
          <Link href={routes.home}>Back Home</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
};

export default LoadingPage;

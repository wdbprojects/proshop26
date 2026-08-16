import { Spinner } from "@/components/ui/spinner";

const LoadingPage = async () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <Spinner className="text-primary size-18" />
    </div>
  );
};

export default LoadingPage;

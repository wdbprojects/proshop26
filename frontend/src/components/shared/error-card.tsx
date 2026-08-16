import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ErrorCard = () => {
  return (
    <div className="my-16 flex w-full items-center justify-center">
      <Card className="flex min-h-50 w-full max-w-md items-center justify-center">
        <CardContent>
          <h2 className="text-destructive text-2xl font-semibold">
            Error retrieving data
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Sometimes unknown errors happen that are not in our hands. Please
            try again or follow the links below.
          </p>
        </CardContent>
        <CardAction className="flex w-full items-center justify-between gap-4 px-4">
          <Button variant="default" className="w-full flex-1" size="sm">
            Browse Catalog
          </Button>
          <Button variant="secondary" className="w-full flex-1" size="sm">
            View Orders
          </Button>
        </CardAction>
      </Card>
    </div>
  );
};

export default ErrorCard;

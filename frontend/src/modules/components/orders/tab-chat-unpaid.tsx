import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangleIcon, LockIcon } from "lucide-react";

const TabChatUnpaid = () => {
  return (
    <Card>
      <CardContent className="text-muted-foreground text-sm">
        <Alert className="mx-auto max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
          <AlertTriangleIcon />
          <AlertTitle>This order is not paid yet!</AlertTitle>
          <p className="">
            Support unlocks when this order is marked <strong>paid</strong>{" "}
            (once payment is confirmed).
          </p>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default TabChatUnpaid;

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { ShoppingCartIcon } from "lucide-react";
import React from "react";

const EmptyCart = () => {
  return (
    <Card className="flex min-h-50 w-full max-w-md items-center justify-center">
      <CardContent>
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          When you add products from the catalog, they&apos;ll show up here.
          Ready when you are.
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
  );
};

export default EmptyCart;

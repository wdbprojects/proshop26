"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Quantity from "@/modules/components/products/quantity";

const AddToCart = () => {
  return (
    <div>
      <div className="mb-0 block">
        <Quantity />
      </div>
      <Separator className="my-4" />
      <div className="mt-4 mb-4 flex flex-col gap-3">
        <Button
          size="default"
          onClick={() => {}}
          className="rounded-none border-none bg-[#ffd812] font-medium text-black shadow-lg hover:bg-[#FFE563]!"
        >
          Add to Card
        </Button>
        <Button
          size="default"
          onClick={() => {}}
          className="rounded-none border-none bg-[#ffa41c] font-medium text-black shadow-lg hover:bg-[#FEBA55]!"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
};

export default AddToCart;

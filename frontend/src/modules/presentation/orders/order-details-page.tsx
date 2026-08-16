"use client";

import { useState } from "react";
import ErrorCard from "@/components/shared/error-card";
import { useOrderDetails } from "@/hooks/use-order-details";
import OrderDetailsTop from "@/modules/components/orders/order-details-top";
import OrderDetailsSkeleton from "@/modules/components/orders/order-details-skeleton";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HeadphonesIcon,
  LayoutListIcon,
  LockIcon,
  MessageCircleIcon,
} from "lucide-react";
import TabChat from "@/modules/components/orders/tab-chat";
import TabSummary from "@/modules/components/orders/tab-summary";
import TabChatUnpaid from "@/modules/components/orders/tab-chat-unpaid";

const OrderDetailsPage = ({ orderId }: { orderId: string }) => {
  const [activeTab, setActiveTab] = useState("summary");
  const { order, items, paid, isLoading, error } = useOrderDetails(orderId);

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }
  if (error) {
    return <ErrorCard />;
  }

  return (
    <div className="space-y-4 p-4 text-left">
      <OrderDetailsTop orderId={orderId} />
      {/* SECOND PART - TABS */}
      <div>
        <div className="border-muted flex items-center gap-2 border-b pb-3">
          <div className="bg-primary/20 flex items-center justify-center rounded-md p-1.5 shadow-md">
            <HeadphonesIcon className="text-primary size-5" aria-hidden />
          </div>
          <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
            Customer Support
          </h2>
        </div>

        <Tabs value={activeTab} className="mt-2 w-full">
          <TabsList className="w-full">
            <TabsTrigger
              value="summary"
              className="flex items-center justify-center gap-2"
              onClick={() => {
                setActiveTab("summary");
              }}
            >
              <LayoutListIcon className="size-4 shrink-0" aria-hidden />
              <span>Summary</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex items-center justify-center gap-2"
              // disabled={paid}
              onClick={() => {
                setActiveTab("chat");
              }}
            >
              {!paid ? (
                <>
                  <LockIcon
                    className="size-4 shrink-0 text-amber-400 dark:text-amber-800"
                    aria-hidden
                  />
                  <span>Support Chat</span>
                </>
              ) : (
                <>
                  <MessageCircleIcon
                    className="text-primary size-3.5 shrink-0"
                    aria-hidden
                  />
                  <span>Support Chat</span>
                </>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <TabSummary order={order} items={items} />
          </TabsContent>
          <TabsContent value="chat">
            {!paid ? (
              <TabChatUnpaid />
            ) : (
              <TabChat paid={paid} orderId={orderId} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrderDetailsPage;

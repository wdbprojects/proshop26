"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/hooks/use-session";

export const useOrderChat = (paid: boolean, orderId: string) => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionData = useSession();

  const role = sessionData?.session?.user?.role;
  const token = sessionData?.session?.session?.token;

  const inviteMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/orders/${orderId}/video-invite`, {
        method: "POST",
      }),
  });

  useEffect(() => {
    // Don't proceed if not paid or no order ID
    if (!paid || !orderId) {
      return undefined;
    }

    let chatClient: StreamChat;

    const connectOrderChat = async () => {
      // Step 1: Create stream channel
      await apiFetch(`/api/orders/${orderId}/stream-channel`, {
        method: "POST",
      });
      // Step 2: Get token
      const tokenData = await apiFetch("/api/stream/token", {
        method: "POST",
      });
      chatClient = StreamChat.getInstance(tokenData?.apiKey);
      await chatClient.connectUser(
        { id: tokenData.userId, name: tokenData.name },
        tokenData.token,
      );
      const channel = chatClient.channel("messaging", `order-${orderId}`);
      await channel.watch();
      setClient(chatClient);
    };

    connectOrderChat().catch((err) => {
      setError(err instanceof Error ? err.message : "Chat failed to load");
    });

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [paid, orderId, token]);

  const channel =
    client && orderId ? client.channel("messaging", `order-${orderId}`) : null;

  const canInvite = role === "support" || role === "admin";

  return {
    client,
    error,
    channel,
    canInvite,
    inviteMutation,
  };
};

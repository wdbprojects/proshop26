import { Env, getEnv } from "../config/env";
import { StreamChat } from "stream-chat";

export const streamChatDisplayName = (
  role: any,
  displayName: string | null,
  email: string,
): string => {
  const base = displayName ?? email.split("@")[0];
  if (role === "admin") return `Admin - ${base}`;
  if (role === "support") return `Support - ${base}`;
  return base;
};

export const getStreamChatServer = (ENV: Env) => {
  return StreamChat.getInstance(ENV.STREAM_API_KEY, ENV.STREAM_API_SECRET);
};

export const streamUserId = (userId: string) => {
  return `betterauth_${userId}`;
};

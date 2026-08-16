import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
// import { polarClient } from "@polar-sh/better-auth/client";

/* interface IOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
  path: string;
} */

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // baseURL: "",
  fetch: (url: string, options: RequestInit) =>
    fetch(url, {
      ...options,
      credentials: "include", // Required for cookies
    }),
  plugins: [
    adminClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
        },
        banned: {
          type: "boolean",
        },
        banReason: {
          type: "string",
        },
        banExpires: {
          type: "date",
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, getSession } = authClient;

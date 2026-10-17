import "../../global.css";
import { useState } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";

const RootLayout = () => {
  // useState with a function so the client is created once, not on every render

  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          retry: (failureCount, error) => {
            // A 4xx will fail again the same way. so only retry network and server errors
            if (
              error instanceof ApiError &&
              error.status >= 400 &&
              error.status < 500
            ) {
              return false;
            }
            return failureCount < 2;
          },
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "FFFFFF" },
        }}
      />
    </QueryClientProvider>
  );
};

export default RootLayout;

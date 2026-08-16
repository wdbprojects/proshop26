import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const useSession = () => {
  const queryClient = useQueryClient();

  const {
    data: session,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["session", "user"],
    queryFn: async () => {
      try {
        const { data: session, error } = await authClient.getSession();
        if (error) {
          if (error.status === 401 || error.message?.includes("Unauthorized")) {
            return null;
          }
          throw error;
        }
        return session;
      } catch (err) {
        console.log("Session fetch error: ", err);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 1,
    retryDelay: 1000,
  });

  const refetchSession = async () => {
    await queryClient.invalidateQueries({ queryKey: ["session", "user"] });
    return refetch();
  };

  return {
    session: session,
    isLoading: isLoading,
    error: error,
    refetchSession: refetchSession,
    isAuthenticated: !!session,
  };
};

export const useUser = () => {
  const { session, isLoading, error } = useSession();
  return {
    user: session?.user,
    isLoading: isLoading,
    error: error,
    isAuthenticated: !!session?.user,
  };
};

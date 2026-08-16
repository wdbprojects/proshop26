import { routes } from "@/config/routes";
import { redirect } from "next/navigation";

// GET SESSION
export const getSession = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user session");
  }
  return response.json();
};

// REQUIRE AUTH
export const requireAuth = async () => {
  const session = await getSession();
  if (!session) {
    redirect(routes.login);
  }
  return session;
};

// REQUIRE UNAUTH
export const requireUnauth = async () => {
  const session = await getSession();
  if (session) {
    redirect(routes.home);
  }
  return session;
};

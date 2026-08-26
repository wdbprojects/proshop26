import { routes } from "@/config/routes";
// import { cookies } from "next/headers";
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

// USE SESSION MANUAL
/* export const getSessionManual = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
      { headers: { Cookie: cookieHeader }, cache: "no-store" },
    );
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (err) {
    console.log(err);
    return null;
  }
}; */

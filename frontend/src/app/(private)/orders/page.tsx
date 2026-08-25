export const dynamic = "force-dynamic";

import { routes } from "@/config/routes";
import OrdersPage from "@/modules/presentation/orders/orders-page";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const getSession = async () => {
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
};

const OrdersPageMain = async () => {
  const sessionData = await getSession();
  if (!sessionData?.session) {
    redirect(routes.login);
  }
  return <OrdersPage sessionDataError={sessionData.error} />;
};

export default OrdersPageMain;

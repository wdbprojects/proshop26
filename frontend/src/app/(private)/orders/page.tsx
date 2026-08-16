// import OrdersPage from "@/modules/presentation/orders/orders-page";
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
      { headers: { Cookie: cookieHeader } },
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const OrdersPageMain = async () => {
  const sessionData = await getSession();
  if (!sessionData.session) {
    redirect(routes.login);
  }

  return <OrdersPage />;
};

export default OrdersPageMain;

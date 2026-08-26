import ProtectedRoute from "@/components/shared/protected-route";
import OrdersPage from "@/modules/presentation/orders/orders-page";

const OrdersPageMain = async () => {
  return (
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  );
};

export default OrdersPageMain;

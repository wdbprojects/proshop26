import ProtectedRoute from "@/components/shared/protected-route";
import CheckoutPage from "@/modules/presentation/checkout/checkout-page";

const CheckoutPageMain = () => {
  return (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  );
};

export default CheckoutPageMain;

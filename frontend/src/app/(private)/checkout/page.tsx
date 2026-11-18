import { Suspense } from "react";
import ProtectedRoute from "@/components/shared/protected-route";
import CheckoutPage from "@/modules/presentation/checkout/checkout-page";

const CheckoutPageMain = () => {
  return (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <CheckoutPage />
      </Suspense>
    </ProtectedRoute>
  );
};

export default CheckoutPageMain;

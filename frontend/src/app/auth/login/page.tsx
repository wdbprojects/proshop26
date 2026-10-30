import GuestRoute from "@/components/shared/guest-route";
import LoginPage from "@/modules/presentation/auth/login-page";
import { Suspense } from "react";

const LoginPageMain = async () => {
  return (
    <GuestRoute>
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    </GuestRoute>
  );
};

export default LoginPageMain;

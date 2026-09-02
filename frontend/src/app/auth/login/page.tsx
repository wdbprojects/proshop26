import GuestRoute from "@/components/shared/guest-route";
import LoginPage from "@/modules/presentation/auth/login-page";

const LoginPageMain = async () => {
  return (
    <GuestRoute>
      <LoginPage />
    </GuestRoute>
  );
};

export default LoginPageMain;

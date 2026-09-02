import GuestRoute from "@/components/shared/guest-route";
import RegisterPage from "@/modules/presentation/auth/register-page";

const RegisterPageMain = () => {
  return (
    <GuestRoute>
      <RegisterPage />
    </GuestRoute>
  );
};

export default RegisterPageMain;

import { Suspense } from "react";
import ResetPasswordForm from "@/modules/components/auth/reset-password-form";

const ResetPasswordPageMain = () => {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPageMain;

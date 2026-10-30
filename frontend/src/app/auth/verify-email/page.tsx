import VerifyEmailCard from "@/modules/components/auth/verify-email-card";
import { Suspense } from "react";

const VerifyEmailPageMain = () => {
  return (
    <Suspense fallback={null}>
      <VerifyEmailCard />
    </Suspense>
  );
};

export default VerifyEmailPageMain;

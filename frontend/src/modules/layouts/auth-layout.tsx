import { LayoutPropsMain } from "@/config/types";
import DarkMode from "@/components/shared/dark-mode";

import HomeButton from "@/modules/components/auth/home-button";

const AuthLayout = ({ children }: LayoutPropsMain) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-row items-center justify-between">
        <HomeButton />
        <DarkMode className="absolute top-5 right-4" />
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;

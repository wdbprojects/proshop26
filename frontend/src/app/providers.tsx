"use client";

import { TanstackProvider } from "@/components/tanstack-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
// import { Toaster } from "@/components/ui/sonner";
import { LayoutPropsMain } from "@/config/types";
import NextTopLoader from "nextjs-toploader";

const Providers = ({ children }: LayoutPropsMain) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <div>
        <NextTopLoader showSpinner={false} color="#fcac00x`" />
        <TanstackProvider>{children}</TanstackProvider>
        {/* <Toaster
          richColors
          closeButton
          position="bottom-right"
          expand={true}
        /> */}
        <Toaster position="top-center" />
      </div>
    </ThemeProvider>
  );
};
export default Providers;

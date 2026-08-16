"use client";

import { TanstackProvider } from "@/components/tanstack-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { LayoutPropsMain } from "@/config/types";
import NextTopLoader from "nextjs-toploader";

const Providers = ({ children }: LayoutPropsMain) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <div>
        <NextTopLoader showSpinner={false} color="#7ccf00" />
        <TanstackProvider>{children}</TanstackProvider>
        <Toaster richColors closeButton position="bottom-right" expand={true} />
      </div>
    </ThemeProvider>
  );
};
export default Providers;

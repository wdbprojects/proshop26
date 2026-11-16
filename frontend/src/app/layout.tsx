import type { Metadata } from "next";
import { Roboto, Oxanium } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/config/brand";

const robotoHeading = Roboto({
  subsets: ["latin"],
  variable: "--font-heading",
});

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: "Multiporpuse Ecommerce Store in Bolivia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", oxanium.variable, robotoHeading.variable)}
    >
      <body className={`antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

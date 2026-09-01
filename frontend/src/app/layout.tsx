import type { Metadata } from "next";
import { Roboto, Oxanium } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import { cn } from "@/lib/utils";

const robotoHeading = Roboto({
  subsets: ["latin"],
  variable: "--font-heading",
});

const oxanium = Oxanium({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "ProShop26",
  description:
    "Ecommerce application made with PERN stack, Next.js, and Tailwind CSS.",
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

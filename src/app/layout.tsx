import type { Metadata } from "next";
import "./globals.css";
import { ConditionalChrome } from "@/components/conditional-chrome";
import { LocaleProvider } from "@/contexts/locale-context";
import { CustomerAuthProvider } from "@/contexts/customer-auth-context";

export const metadata: Metadata = {
  title: "Siargao Food Delivery | General Luna Restaurants",
  description: "Food delivery in General Luna, Siargao Island.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Siargao Delivery",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="font-sans flex flex-col min-h-screen" suppressHydrationWarning>
        <LocaleProvider>
          <CustomerAuthProvider>
            <ConditionalChrome>{children}</ConditionalChrome>
          </CustomerAuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

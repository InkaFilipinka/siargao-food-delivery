import type { Metadata } from "next";
import "./globals.css";
import { NavigationWrapper } from "@/components/navigation-wrapper";
import { Footer } from "@/components/footer";
import { LocaleProvider } from "@/contexts/locale-context";

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
      <body className="font-sans flex flex-col min-h-screen">
        <LocaleProvider>
          <NavigationWrapper />
          <div className="flex-1">{children}</div>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}

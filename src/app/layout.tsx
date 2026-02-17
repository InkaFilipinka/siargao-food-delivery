import type { Metadata } from "next";
import "./globals.css";
import { NavigationWrapper } from "@/components/navigation-wrapper";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Siargao Food Delivery | General Luna Restaurants",
  description: "Food delivery in General Luna, Siargao Island.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="font-sans flex flex-col min-h-screen">
        <NavigationWrapper />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

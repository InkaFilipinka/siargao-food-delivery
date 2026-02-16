import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Siargao Food Delivery | General Luna Restaurants",
  description: "Food delivery in General Luna, Siargao Island.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}

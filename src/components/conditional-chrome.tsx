"use client";

import { usePathname } from "next/navigation";
import { NavigationWrapper } from "./navigation-wrapper";
import { Footer } from "./footer";

export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobilePreview = pathname?.startsWith("/mobile-preview");

  return (
    <>
      {!isMobilePreview && <NavigationWrapper />}
      <div className="flex-1">{children}</div>
      {!isMobilePreview && <Footer />}
    </>
  );
}

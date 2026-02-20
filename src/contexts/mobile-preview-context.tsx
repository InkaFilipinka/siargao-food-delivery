"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type MobileScreen =
  | "landing"
  | "home"
  | "restaurant"
  | "cart"
  | "checkout"
  | "track"
  | "orders"
  | "driver-hub"
  | "driver-earnings"
  | "restaurant-dashboard"
  | "partner-login"
  // CURSOR placeholders (missing from Figma)
  | "account"
  | "location-picker"
  | "forgot-password"
  | "sign-up"
  | "order-detail"
  | "item-detail"
  | "support"
  | "notifications"
  | "edit-address"
  | "edit-phone"
  | "payout-settings"
  | "trip-history";

const MobilePreviewContext = createContext<{
  screen: MobileScreen;
  goTo: (s: MobileScreen) => void;
  history: MobileScreen[];
  goBack: () => void;
} | null>(null);

export function useMobilePreview() {
  const ctx = useContext(MobilePreviewContext);
  return ctx;
}

export function MobilePreviewProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<MobileScreen>("landing");
  const [history, setHistory] = useState<MobileScreen[]>(["landing"]);

  const goTo = useCallback((s: MobileScreen) => {
    setScreen(s);
    setHistory((prev) => [...prev, s]);
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      setScreen(next[next.length - 1]!);
      return next;
    });
  }, []);

  return (
    <MobilePreviewContext.Provider value={{ screen, goTo, history, goBack }}>
      {children}
    </MobilePreviewContext.Provider>
  );
}

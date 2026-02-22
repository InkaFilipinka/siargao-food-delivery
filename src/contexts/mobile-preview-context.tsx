"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type MobileScreen =
  | "role-select"
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
  | "personal-info"
  | "saved-addresses"
  | "payment-methods"
  | "favorites"
  | "help-support"
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

export type DeliveryLocation = {
  lat: number;
  lng: number;
  distance: number;
  placeName?: string;
};

export type PartnerLoginRole = "driver" | "restaurant" | null;

const MobilePreviewContext = createContext<{
  screen: MobileScreen;
  goTo: (s: MobileScreen) => void;
  history: MobileScreen[];
  goBack: () => void;
  mapOpen: boolean;
  setMapOpen: (open: boolean) => void;
  deliveryLocation: DeliveryLocation | null;
  setDeliveryLocation: (loc: DeliveryLocation | null) => void;
  selectedRestaurantSlug: string | null;
  setSelectedRestaurantSlug: (slug: string | null) => void;
  partnerLoginRole: PartnerLoginRole;
  setPartnerLoginRole: (role: PartnerLoginRole) => void;
} | null>(null);

export function useMobilePreview() {
  const ctx = useContext(MobilePreviewContext);
  return ctx;
}

export function MobilePreviewProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<MobileScreen>("role-select");
  const [history, setHistory] = useState<MobileScreen[]>(["role-select"]);
  const [mapOpen, setMapOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [selectedRestaurantSlug, setSelectedRestaurantSlug] = useState<string | null>(null);
  const [partnerLoginRole, setPartnerLoginRole] = useState<PartnerLoginRole>(null);

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
    <MobilePreviewContext.Provider
      value={{
        screen,
        goTo,
        history,
        goBack,
        mapOpen,
        setMapOpen,
        deliveryLocation,
        setDeliveryLocation,
        selectedRestaurantSlug,
        setSelectedRestaurantSlug,
        partnerLoginRole,
        setPartnerLoginRole,
      }}
    >
      {children}
    </MobilePreviewContext.Provider>
  );
}

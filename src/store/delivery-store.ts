"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDeliveryFee } from "@/config/delivery-zones";

export interface DeliveryLocation {
  lat: number;
  lng: number;
  distance: number;
  placeName?: string;
  zoneId: string;
  zoneName: string;
  feePhp: number;
}

interface DeliveryState {
  location: DeliveryLocation | null;
  setLocation: (loc: { lat: number; lng: number; distance: number; placeName?: string }) => void;
  clearLocation: () => void;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      location: null,

      setLocation: (loc) => {
        const { feePhp, zone } = getDeliveryFee(loc.distance);
        set({
          location: {
            ...loc,
            zoneId: zone.id,
            zoneName: zone.name,
            feePhp,
          },
        });
      },

      clearLocation: () => set({ location: null }),
    }),
    { name: "siargao-delivery" }
  )
);

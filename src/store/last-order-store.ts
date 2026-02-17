"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/order";

interface LastOrderState {
  items: CartItem[] | null;
  setLastOrder: (items: CartItem[]) => void;
  clearLastOrder: () => void;
}

export const useLastOrderStore = create<LastOrderState>()(
  persist(
    (set) => ({
      items: null,
      setLastOrder: (items) => set({ items }),
      clearLastOrder: () => set({ items: null }),
    }),
    { name: "siargao-last-order" }
  )
);

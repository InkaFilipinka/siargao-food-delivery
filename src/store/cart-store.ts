"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/order";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "priceValue"> & { quantity?: number }) => void;
  removeItem: (restaurantSlug: string, itemName: string) => void;
  updateQuantity: (restaurantSlug: string, itemName: string, quantity: number) => void;
  clearCart: () => void;
  clearRestaurant: (restaurantSlug: string) => void;
}

function parsePrice(price: string): number {
  const match = price.match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.restaurantSlug === item.restaurantSlug && i.itemName === item.itemName
          );
          const qty = item.quantity ?? 1;
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.restaurantSlug === item.restaurantSlug && i.itemName === item.itemName
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                restaurantName: item.restaurantName,
                restaurantSlug: item.restaurantSlug,
                itemName: item.itemName,
                price: item.price,
                priceValue: parsePrice(item.price),
                quantity: qty,
              },
            ],
          };
        }),

      removeItem: (restaurantSlug, itemName) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.restaurantSlug === restaurantSlug && i.itemName === itemName)
          ),
        })),

      updateQuantity: (restaurantSlug, itemName, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.restaurantSlug === restaurantSlug && i.itemName === itemName)
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.restaurantSlug === restaurantSlug && i.itemName === itemName
                ? { ...i, quantity }
                : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      clearRestaurant: (restaurantSlug) =>
        set((state) => ({
          items: state.items.filter((i) => i.restaurantSlug !== restaurantSlug),
        })),
    }),
    { name: "siargao-cart" }
  )
);

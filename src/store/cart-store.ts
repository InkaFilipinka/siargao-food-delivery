"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/order";
import { getIsGroceryBySlug } from "@/data/combined";

const ORDER_LIMIT_MSG =
  "Each order can include items from at most 1 restaurant and 1 grocery. For more, please place a separate order.";

function isGrocery(item: CartItem): boolean {
  return item.isGrocery ?? getIsGroceryBySlug(item.restaurantSlug);
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "priceValue"> & { quantity?: number; isGrocery?: boolean }) => boolean;
  removeItem: (restaurantSlug: string, itemName: string) => void;
  updateQuantity: (restaurantSlug: string, itemName: string, quantity: number) => void;
  clearCart: () => void;
  clearRestaurant: (restaurantSlug: string) => void;
  addItemError: string | null;
  clearAddItemError: () => void;
}

function parsePrice(price: string): number {
  const match = price.match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItemError: null,

      addItem: (item) => {
        const state = get();
        const newIsGrocery = item.isGrocery ?? getIsGroceryBySlug(item.restaurantSlug);

        const existing = state.items.find(
          (i) => i.restaurantSlug === item.restaurantSlug && i.itemName === item.itemName
        );
        const qty = item.quantity ?? 1;

        if (existing) {
          set({
            items: state.items.map((i) =>
              i.restaurantSlug === item.restaurantSlug && i.itemName === item.itemName
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
            addItemError: null,
          });
          return true;
        }

        const uniqueSlugs = [...new Set(state.items.map((i) => i.restaurantSlug))];
        const grocerySlugs = uniqueSlugs.filter((slug) => isGrocery(state.items.find((i) => i.restaurantSlug === slug)!));
        const restaurantSlugs = uniqueSlugs.filter((slug) => !isGrocery(state.items.find((i) => i.restaurantSlug === slug)!));

        if (newIsGrocery) {
          if (grocerySlugs.length > 0 && grocerySlugs[0] !== item.restaurantSlug) {
            set({ addItemError: ORDER_LIMIT_MSG });
            return false;
          }
        } else {
          if (restaurantSlugs.length > 0 && restaurantSlugs[0] !== item.restaurantSlug) {
            set({ addItemError: ORDER_LIMIT_MSG });
            return false;
          }
        }

        set({
          items: [
            ...state.items,
            {
              restaurantName: item.restaurantName,
              restaurantSlug: item.restaurantSlug,
              itemName: item.itemName,
              price: item.price,
              priceValue: parsePrice(item.price),
              quantity: qty,
              isGrocery: newIsGrocery,
            },
          ],
          addItemError: null,
        });
        return true;
      },

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

      clearAddItemError: () => set({ addItemError: null }),
    }),
    { name: "siargao-cart", partialize: (s) => ({ items: s.items }) }
  )
);

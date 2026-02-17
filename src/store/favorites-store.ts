"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  restaurantSlugs: string[];
  toggleRestaurant: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      restaurantSlugs: [],

      toggleRestaurant: (slug) =>
        set((state) => {
          const exists = state.restaurantSlugs.includes(slug);
          return {
            restaurantSlugs: exists
              ? state.restaurantSlugs.filter((s) => s !== slug)
              : [...state.restaurantSlugs, slug],
          };
        }),

      isFavorite: (slug) => get().restaurantSlugs.includes(slug),
    }),
    { name: "siargao-favorites" }
  )
);

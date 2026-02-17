"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FavoriteItem {
  restaurantSlug: string;
  itemName: string;
}

interface FavoritesState {
  restaurantSlugs: string[];
  itemFavorites: FavoriteItem[];
  toggleRestaurant: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  toggleItemFavorite: (restaurantSlug: string, itemName: string) => void;
  isItemFavorite: (restaurantSlug: string, itemName: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      restaurantSlugs: [],
      itemFavorites: [],

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

      toggleItemFavorite: (restaurantSlug, itemName) =>
        set((state) => {
          const exists = state.itemFavorites.some(
            (i) => i.restaurantSlug === restaurantSlug && i.itemName === itemName
          );
          return {
            itemFavorites: exists
              ? state.itemFavorites.filter(
                  (i) => !(i.restaurantSlug === restaurantSlug && i.itemName === itemName)
                )
              : [...state.itemFavorites, { restaurantSlug, itemName }],
          };
        }),

      isItemFavorite: (restaurantSlug, itemName) =>
        get().itemFavorites.some(
          (i) => i.restaurantSlug === restaurantSlug && i.itemName === itemName
        ),
    }),
    { name: "siargao-favorites" }
  )
);

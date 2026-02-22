"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type MobileRestaurant = {
  name: string;
  slug: string;
  categories: string[];
  priceRange: string | null;
  tags: string[];
  menuUrl: string;
  menuItems: { name: string; price: string }[];
  imageUrls: string[];
  featuredImage: string | null;
  hours?: string | null;
  minOrderPhp?: number | null;
  lat?: number | null;
  lng?: number | null;
};

type MobileRestaurantsContextValue = {
  restaurants: MobileRestaurant[];
  categories: string[];
  ratings: Record<string, { avg: number; count: number }>;
  loading: boolean;
};

const MobileRestaurantsContext = createContext<MobileRestaurantsContextValue | null>(null);

export function useMobileRestaurants() {
  const ctx = useContext(MobileRestaurantsContext);
  return ctx;
}

export function MobileRestaurantsProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<MobileRestaurant[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurants", { cache: "no-store", headers: { "Cache-Control": "no-cache" } })
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.restaurants || []);
        setCategories(data.categories || ["All"]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!restaurants.length) return;
    const slugs = restaurants.map((r) => r.slug).slice(0, 50);
    fetch(`/api/restaurants/ratings?slugs=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((d) => setRatings(d.ratings || {}))
      .catch(() => {});
  }, [restaurants]);

  return (
    <MobileRestaurantsContext.Provider value={{ restaurants, categories, ratings, loading }}>
      {children}
    </MobileRestaurantsContext.Provider>
  );
}

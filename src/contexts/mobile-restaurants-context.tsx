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
  refetch: () => void;
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

  const fetchRestaurants = React.useCallback(() => {
    setLoading(true);
    fetch(`/api/restaurants?t=${Date.now()}`, { cache: "no-store", headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } })
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.restaurants || []);
        setCategories(data.categories || ["All"]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    const onFocus = () => fetchRestaurants();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchRestaurants]);

  useEffect(() => {
    if (!restaurants.length) return;
    const slugs = restaurants.map((r) => r.slug).slice(0, 50);
    fetch(`/api/restaurants/ratings?slugs=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((d) => setRatings(d.ratings || {}))
      .catch(() => {});
  }, [restaurants]);

  return (
    <MobileRestaurantsContext.Provider value={{ restaurants, categories, ratings, loading, refetch: fetchRestaurants }}>
      {children}
    </MobileRestaurantsContext.Provider>
  );
}

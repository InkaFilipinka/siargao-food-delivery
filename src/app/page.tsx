"use client";

import { useState, useEffect, useMemo } from "react";
import { RestaurantCard } from "@/components/restaurant-card";
import { MapPicker } from "@/components/map-picker";
import { MapPin, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

type Restaurant = {
  name: string;
  slug: string;
  categories: string[];
  priceRange: string | null;
  tags: string[];
  menuUrl: string;
  menuItems: { name: string; price: string }[];
  imageUrls: string[];
  featuredImage: string | null;
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mapOpen, setMapOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<{
    lat: number;
    lng: number;
    distance: number;
    placeName?: string;
  } | null>(null);
  const [data, setData] = useState<{
    restaurants: Restaurant[];
    categories: string[];
    cravingCategories: string[];
    tagline: string;
    description: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredRestaurants = useMemo(() => {
    if (!data) return [];
    if (selectedCategory === "All") return data.restaurants;
    return data.restaurants.filter((r) => r.categories.includes(selectedCategory));
  }, [data, selectedCategory]);

  if (loading) {
    return (
      <main className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load restaurants</p>
      </main>
    );
  }

  return (
    <main className="pt-16 md:pt-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/80 to-yellow-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-200/30 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
              {data.tagline}
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              {data.description}
            </p>
            <button
              onClick={() => setMapOpen(true)}
              className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/25"
            >
              <MapPin className="w-5 h-5" />
              {deliveryLocation
                ? `${deliveryLocation.placeName || "Location set"} • ${deliveryLocation.distance}km`
                : "Set delivery location"}
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="py-12 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Browse by category
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.categories.map((cat) => {
              const count =
                cat === "All"
                  ? data.restaurants.length
                  : data.restaurants.filter((r) => r.categories.includes(cat)).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    selectedCategory === cat
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {cat} {count > 0 && count}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Craving */}
      <section className="py-8 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Or find what you&apos;re craving
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.cravingCategories.map((cat) => {
              const mapCat =
                cat === "Asian Cuisine" ? "Asian" : cat === "Cheap Eats" ? "Cheap" : cat === "Drinks" ? "Coffee Shops" : cat;
              const isActive = selectedCategory === mapCat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(mapCat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-orange-500 text-white"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-300"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Restaurants */}
      <section id="restaurants" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UtensilsCrossed className="w-8 h-8 text-orange-500" />
              {selectedCategory === "All" ? "All Restaurants" : selectedCategory}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {filteredRestaurants.length} {selectedCategory === "All" ? "restaurants" : "results"}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.name} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </section>

      {/* Order CTA */}
      <section id="order" className="py-16 bg-slate-50 dark:bg-slate-800/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ready to order?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-lg mx-auto">
            Browse menus above, pick your favorites, and contact us via WhatsApp to place your order.
          </p>
          <a
            href="https://wa.me/639457014440"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Order via WhatsApp
          </a>
        </div>
      </section>

      <MapPicker
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onLocationSelect={(loc) => {
          setDeliveryLocation(loc);
          setMapOpen(false);
        }}
      />
    </main>
  );
}

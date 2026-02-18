"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getIsGroceryBySlug } from "@/data/combined";
import { RestaurantCard } from "@/components/restaurant-card";
import { MapPicker } from "@/components/map-picker";
import { MapPin, RotateCcw, EyeOff, Plus, Search } from "lucide-react";
import { HomePageSkeleton } from "@/components/skeleton-card";
import { cn } from "@/lib/utils";
import { useDeliveryStore } from "@/store/delivery-store";
import { useLastOrderStore } from "@/store/last-order-store";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { isOpenNow } from "@/config/restaurant-extras";

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
  hours?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mapOpen, setMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "rating" | "name">("default");
  const { location: deliveryLocation, setLocation } = useDeliveryStore();
  const router = useRouter();
  const lastOrder = useLastOrderStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const [hideClosed, setHideClosed] = useState(false);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
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

  useEffect(() => {
    if (!data?.restaurants?.length) return;
    const slugs = data.restaurants.map((r) => r.slug).slice(0, 50);
    fetch(`/api/restaurants/ratings?slugs=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((d) => setRatings(d.ratings || {}))
      .catch(() => {});
  }, [data?.restaurants]);

  const favorites = useFavoritesStore((s) => s.restaurantSlugs);
  const itemFavorites = useFavoritesStore((s) => s.itemFavorites);

  const favoriteItemsWithData = useMemo(() => {
    if (!data) return [];
    let list = itemFavorites
      .map((fav) => {
        const rest = data.restaurants.find((r) => r.slug === fav.restaurantSlug);
        const item = rest?.menuItems.find((m) => m.name === fav.itemName);
        if (!rest || !item) return null;
        return { restaurant: rest, item };
      })
      .filter(Boolean) as { restaurant: Restaurant; item: { name: string; price: string } }[];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (f) =>
          f.item.name.toLowerCase().includes(q) ||
          f.restaurant.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, itemFavorites, searchQuery]);

  const filteredRestaurants = useMemo(() => {
    if (!data) return [];
    let list =
      selectedCategory === "Favorite items"
        ? [] // Handled separately
        : selectedCategory === "Favorites"
          ? favorites.length === 0
            ? []
            : data.restaurants.filter((r) => favorites.includes(r.slug))
          : selectedCategory === "All"
          ? data.restaurants
          : data.restaurants.filter((r) => r.categories.includes(selectedCategory));
    if (hideClosed && list.length > 0) {
      list = list.filter((r) => {
        if (!r.hours) return true;
        const open = isOpenNow(r.hours);
        return open === null || open === true;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.categories.some((c) => c.toLowerCase().includes(q)) ||
          r.tags?.some((t) => t.toLowerCase().includes(q)) ||
          r.menuItems?.some((m) => m.name.toLowerCase().includes(q))
      );
    }
    if (sortBy === "rating") {
      list = [...list].sort((a, b) => (ratings[b.slug]?.avg ?? 0) - (ratings[a.slug]?.avg ?? 0));
    } else if (sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [data, selectedCategory, favorites, hideClosed, searchQuery, sortBy, ratings]);

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (!data) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Failed to load. Please refresh.</p>
      </main>
    );
  }

  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Delivery location bar */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => setMapOpen(true)}
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
          >
            <div className="p-2 rounded-full bg-primary/10">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Deliver to
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {deliveryLocation
                  ? deliveryLocation.placeName || "Location set"
                  : "Set delivery location"}
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Search */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants or menu items..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Categories - horizontal scroll */}
      <section id="categories" className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {favorites.length > 0 && (
              <button
                onClick={() => setSelectedCategory("Favorites")}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  selectedCategory === "Favorites"
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                ♥ Restaurants
              </button>
            )}
            {favoriteItemsWithData.length > 0 && (
              <button
                onClick={() => setSelectedCategory("Favorite items")}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  selectedCategory === "Favorite items"
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                ♥ Items ({favoriteItemsWithData.length})
              </button>
            )}
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
                    "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {cat} {count > 0 && <span className="opacity-80">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Restaurants grid */}
      <section id="restaurants" className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {selectedCategory === "All"
              ? "Restaurants, Groceries & More"
              : selectedCategory === "Favorites"
                ? "Your Favorites"
                : selectedCategory === "Favorite items"
                  ? "Your Favorite Items"
                  : selectedCategory}
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "default" | "rating" | "name")}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            >
              <option value="default">Sort: Default</option>
              <option value="rating">Sort: Rating</option>
              <option value="name">Sort: Name</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={hideClosed}
                onChange={(e) => setHideClosed(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <EyeOff className="w-4 h-4" />
              Hide closed
            </label>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {selectedCategory === "Favorite items"
                ? `${favoriteItemsWithData.length} items`
                : `${filteredRestaurants.length} ${selectedCategory === "All" ? "venues" : "results"}`}
            </span>
          </div>
        </div>

        {selectedCategory === "Favorite items" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {favoriteItemsWithData.map(({ restaurant, item }, i) => (
              <div
                key={`${restaurant.slug}-${item.name}`}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{restaurant.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{item.price}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const ok = addItem({
                        restaurantName: restaurant.name,
                        restaurantSlug: restaurant.slug,
                        itemName: item.name,
                        price: item.price,
                        quantity: 1,
                        isGrocery: restaurant.categories?.includes("Groceries"),
                      });
                      if (ok) router.push("/checkout");
                      else window.alert(
                        "Each order can include items from at most 1 restaurant and 1 grocery. For more, please place a separate order."
                      );
                    }}
                    className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                    aria-label={`Add ${item.name} to cart`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/restaurant/${restaurant.slug}`)}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600"
                  >
                    View menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant, i) => (
            <div key={restaurant.name} className="animate-in" style={{ animationDelay: `${i * 30}ms` }}>
              <RestaurantCard restaurant={restaurant} rating={ratings[restaurant.slug]} />
            </div>
          ))}
        </div>
        )}

        {(selectedCategory === "Favorite items"
          ? favoriteItemsWithData.length === 0
          : filteredRestaurants.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <EyeOff className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-900 dark:text-white">
              {selectedCategory === "Favorite items" ? "No favorite items yet" : "No venues found"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center max-w-sm">
              {selectedCategory === "Favorite items"
                ? "Tap the heart on menu items to add them here."
                : "Try a different category or turn off &quot;Hide closed&quot; to see more options."}
            </p>
          </div>
        )}
      </section>

      {/* Reorder */}
      {lastOrder && lastOrder.length > 0 && (
        <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <button
              onClick={() => {
                const bySlug = new Map<string, boolean>();
                for (const item of lastOrder) {
                  const slug = item.restaurantSlug;
                  if (!bySlug.has(slug)) {
                    bySlug.set(slug, (item as { isGrocery?: boolean }).isGrocery ?? getIsGroceryBySlug(slug));
                  }
                }
                const groceryCount = [...bySlug.values()].filter(Boolean).length;
                const restaurantCount = bySlug.size - groceryCount;
                if (groceryCount > 1 || restaurantCount > 1) {
                  window.alert(
                    "Each order can include items from at most 1 restaurant and 1 grocery. Your last order had more — please add items manually or place separate orders."
                  );
                  return;
                }
                for (const item of lastOrder) {
                  addItem({
                    restaurantName: item.restaurantName,
                    restaurantSlug: item.restaurantSlug,
                    itemName: item.itemName,
                    price: item.price,
                    quantity: item.quantity,
                    isGrocery: (item as { isGrocery?: boolean }).isGrocery ?? getIsGroceryBySlug(item.restaurantSlug),
                  });
                }
                router.push("/checkout");
              }}
              className="flex items-center gap-3 w-full sm:w-auto justify-center px-6 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reorder last order ({lastOrder.length} items)
            </button>
          </div>
        </section>
      )}

      <MapPicker
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onLocationSelect={(loc) => {
          setLocation(loc);
          setMapOpen(false);
        }}
      />
    </main>
  );
}

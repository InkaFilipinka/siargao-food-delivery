"use client";

import { MapPin, ChevronRight, UtensilsCrossed, Heart, Clock, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favorites-store";
import { useDeliveryStore } from "@/store/delivery-store";
import { isOpenNow } from "@/config/restaurant-extras";
import { haversineKm } from "@/config/delivery-zones";

type RestaurantWithMenu = {
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

interface RestaurantCardProps {
  restaurant: RestaurantWithMenu;
  className?: string;
  rating?: { avg: number; count: number };
}

function formatHours(h: string): string {
  const [open, close] = h.split("-").map((s) => s.trim());
  if (!open || !close) return h;
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const h12 = h % 12 || 12;
    const ampm = h < 12 ? "am" : "pm";
    return m ? `${h12}:${String(m).padStart(2, "0")}${ampm}` : `${h12}${ampm}`;
  };
  return `${fmt(open)}–${fmt(close)}`;
}

export function RestaurantCard({ restaurant, className, rating }: RestaurantCardProps) {
  const { isFavorite, toggleRestaurant } = useFavoritesStore();
  const deliveryLocation = useDeliveryStore((s) => s.location);
  const isFav = isFavorite(restaurant.slug);
  const priceDisplay = restaurant.priceRange || "—";
  const openStatus = restaurant.hours ? isOpenNow(restaurant.hours) : null;
  const distanceKm =
    deliveryLocation &&
    restaurant.lat != null &&
    restaurant.lng != null
      ? haversineKm(deliveryLocation.lat, deliveryLocation.lng, restaurant.lat, restaurant.lng)
      : null;

  return (
    <Link
      href={`/restaurant/${restaurant.slug}`}
      className={cn(
        "group block rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-200 ease-out hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="aspect-[16/10] relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {restaurant.featuredImage ? (
          <img
            src={restaurant.featuredImage}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <UtensilsCrossed className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {openStatus !== null && (
            <span
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium",
                openStatus
                  ? "bg-white/95 dark:bg-slate-900/95 text-green-700 dark:text-green-400"
                  : "bg-slate-800/90 text-slate-200"
              )}
            >
              {openStatus ? "Open" : "Closed"}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleRestaurant(restaurant.slug);
            }}
            className="p-2 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-sm"
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn("w-4 h-4", isFav ? "fill-red-500 text-red-500" : "text-slate-500")}
            />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {restaurant.categories.slice(0, 2).join(" • ")}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform duration-200" />
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
          {rating && rating.count > 0 && (
            <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              {rating.avg.toFixed(1)} ({rating.count})
            </span>
          )}
          <span className="font-medium text-slate-700 dark:text-slate-300">{priceDisplay}</span>
          {distanceKm != null && (
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5" />
              {distanceKm} km away
            </span>
          )}
          {restaurant.hours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatHours(restaurant.hours)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

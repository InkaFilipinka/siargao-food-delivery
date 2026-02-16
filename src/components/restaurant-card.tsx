"use client";

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
};
import { MapPin, ChevronRight, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface RestaurantCardProps {
  restaurant: RestaurantWithMenu;
  className?: string;
}

export function RestaurantCard({ restaurant, className }: RestaurantCardProps) {
  const priceDisplay = restaurant.priceRange || "—";
  const itemCount = restaurant.menuItems.length;

  return (
    <Link
      href={`/restaurant/${restaurant.slug}`}
      className={cn(
        "group block rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden transition-all hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800",
        className
      )}
    >
      {/* Image or placeholder */}
      <div className="aspect-[16/10] relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {restaurant.featuredImage ? (
          <img
            src={restaurant.featuredImage}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 dark:from-slate-700 dark:to-slate-800">
            <UtensilsCrossed className="w-12 h-12 text-orange-300 dark:text-slate-500" />
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {restaurant.name}
            </h3>
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-1">
              {priceDisplay}
              {itemCount > 0 && (
                <span className="text-slate-500 dark:text-slate-400 ml-2">
                  • {itemCount} items
                </span>
              )}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 shrink-0" />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {restaurant.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            >
              {cat}
            </span>
          ))}
        </div>
        {restaurant.tags.length > 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {restaurant.tags.join(" • ")}
          </p>
        )}
      </div>
      <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <MapPin className="w-4 h-4" />
        General Luna, Siargao
      </div>
    </Link>
  );
}

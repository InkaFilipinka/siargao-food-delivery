"use client";

import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { Plus, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DietaryTag } from "@/data/dietary-tags";

interface MenuItemRowProps {
  restaurantName: string;
  restaurantSlug: string;
  itemName: string;
  price: string;
  available?: boolean;
  isGrocery?: boolean;
  dietaryTags?: DietaryTag[];
}

export function MenuItemRow({
  restaurantName,
  restaurantSlug,
  itemName,
  price,
  available = true,
  isGrocery = false,
  dietaryTags = [],
}: MenuItemRowProps) {
  const addItem = useCartStore((s) => s.addItem);
  const clearAddItemError = useCartStore((s) => s.clearAddItemError);
  const isItemFav = useFavoritesStore((s) => s.isItemFavorite(restaurantSlug, itemName));
  const toggleItemFav = useFavoritesStore((s) => s.toggleItemFavorite);

  return (
    <li
      className={cn(
        "flex items-center justify-between gap-4 px-6 py-4 transition-colors group",
        available ? "hover:bg-slate-50 dark:hover:bg-slate-800/30" : "opacity-60"
      )}
    >
      <div className="min-w-0 flex-1 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleItemFav(restaurantSlug, itemName);
          }}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-orange-500 transition-colors"
          aria-label={isItemFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn("w-4 h-4", isItemFav && "fill-orange-500 text-orange-500")}
          />
        </button>
        <div className="min-w-0 flex-1">
          <span className="font-medium text-slate-900 dark:text-white">{itemName}</span>
          {dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {dietaryTags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                >
                  {t.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {price}
            {!available && (
              <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">Sold out</span>
            )}
          </p>
        </div>
      </div>
      {available ? (
        <button
          onClick={() => {
            clearAddItemError();
            const ok = addItem({
              restaurantName,
              restaurantSlug,
              itemName,
              price,
              quantity: 1,
              isGrocery,
            });
            if (!ok && typeof window !== "undefined") {
              window.alert(
                "Each order can include items from at most 1 restaurant and 1 grocery. For more, please place a separate order."
              );
            }
          }}
          className="shrink-0 p-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          aria-label={`Add ${itemName} to cart`}
        >
          <Plus className="w-4 h-4" />
        </button>
      ) : (
        <span className="shrink-0 text-sm text-slate-400">Unavailable</span>
      )}
    </li>
  );
}

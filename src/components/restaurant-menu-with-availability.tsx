"use client";

import { useState, useEffect, useMemo } from "react";
import { MenuItemRow } from "@/components/menu-item-row";
import { DIETARY_OPTIONS, getItemDietaryTags, type DietaryTag } from "@/data/dietary-tags";
import type { RestaurantWithMenu } from "@/data/combined";

interface RestaurantMenuWithAvailabilityProps {
  restaurant: RestaurantWithMenu;
}

export function RestaurantMenuWithAvailability({ restaurant }: RestaurantMenuWithAvailabilityProps) {
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [dietaryFilter, setDietaryFilter] = useState<DietaryTag | null>(null);

  useEffect(() => {
    fetch(`/api/restaurant/items/availability?slug=${encodeURIComponent(restaurant.slug)}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data.availability || {}))
      .catch(() => setAvailability({}));
  }, [restaurant.slug]);

  const filteredItems = useMemo(() => {
    if (!dietaryFilter) return restaurant.menuItems;
    return restaurant.menuItems.filter((item) => {
      const tags = getItemDietaryTags(restaurant.slug, item.name);
      return tags.includes(dietaryFilter);
    });
  }, [restaurant.menuItems, restaurant.slug, dietaryFilter]);

  const hasAnyTaggedItems = restaurant.menuItems.some((item) =>
    getItemDietaryTags(restaurant.slug, item.name).length > 0
  );

  return (
    <>
      {hasAnyTaggedItems && (
        <div className="px-6 py-3 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 self-center">Filter:</span>
          {DIETARY_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => setDietaryFilter(dietaryFilter === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                dietaryFilter === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tag.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      )}
      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {filteredItems.map((item, i) => (
          <MenuItemRow
            key={i}
            restaurantName={restaurant.name}
            restaurantSlug={restaurant.slug}
            itemName={item.name}
            price={item.price}
            available={availability[item.name] !== false}
            isGrocery={restaurant.categories?.includes("Groceries")}
            dietaryTags={getItemDietaryTags(restaurant.slug, item.name)}
          />
        ))}
      </ul>
      {filteredItems.length === 0 && (
        <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          No items match this filter.
        </div>
      )}
    </>
  );
}

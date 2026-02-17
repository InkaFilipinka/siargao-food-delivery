"use client";

import { useState, useEffect } from "react";
import { MenuItemRow } from "@/components/menu-item-row";
import type { RestaurantWithMenu } from "@/data/combined";

interface RestaurantMenuWithAvailabilityProps {
  restaurant: RestaurantWithMenu;
}

export function RestaurantMenuWithAvailability({ restaurant }: RestaurantMenuWithAvailabilityProps) {
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/restaurant/items/availability?slug=${encodeURIComponent(restaurant.slug)}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data.availability || {}))
      .catch(() => setAvailability({}));
  }, [restaurant.slug]);

  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {restaurant.menuItems.map((item, i) => (
        <MenuItemRow
          key={i}
          restaurantName={restaurant.name}
          restaurantSlug={restaurant.slug}
          itemName={item.name}
          price={item.price}
          available={availability[item.name] !== false}
        />
      ))}
    </ul>
  );
}

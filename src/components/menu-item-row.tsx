"use client";

import { useCartStore } from "@/store/cart-store";
import { Plus } from "lucide-react";

interface MenuItemRowProps {
  restaurantName: string;
  restaurantSlug: string;
  itemName: string;
  price: string;
}

export function MenuItemRow({
  restaurantName,
  restaurantSlug,
  itemName,
  price,
}: MenuItemRowProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <li className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
      <span className="text-slate-900 dark:text-white">{itemName}</span>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-amber-600 dark:text-amber-400 font-medium">
          {price}
        </span>
        <button
          onClick={() =>
            addItem({
              restaurantName,
              restaurantSlug,
              itemName,
              price,
              quantity: 1,
            })
          }
          className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white opacity-80 group-hover:opacity-100 transition-opacity"
          aria-label={`Add ${itemName} to cart`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}

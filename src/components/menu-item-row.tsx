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
      <div className="min-w-0 flex-1">
        <span className="font-medium text-slate-900 dark:text-white">{itemName}</span>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{price}</p>
      </div>
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
        className="shrink-0 p-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        aria-label={`Add ${itemName} to cart`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </li>
  );
}

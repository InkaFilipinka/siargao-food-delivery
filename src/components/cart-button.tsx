"use client";

import { useCartStore } from "@/store/cart-store";
import { ShoppingBag } from "lucide-react";

interface CartButtonProps {
  onClick: () => void;
  className?: string;
}

export function CartButton({ onClick, className }: CartButtonProps) {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors ${className ?? ""}`}
      aria-label={`Cart: ${count} items`}
    >
      <ShoppingBag className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

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
      className={`relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${className ?? ""}`}
      aria-label={`Cart: ${count} items`}
    >
      <ShoppingBag className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

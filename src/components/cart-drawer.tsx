"use client";

import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { X, Minus, Plus } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity } = useCartStore();

  const totalPhp = items.reduce((sum, i) => sum + i.priceValue * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col cart-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Your order ({itemCount} {itemCount === 1 ? "item" : "items"})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-white">Your cart is empty</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add items from a restaurant menu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.restaurantSlug}-${item.itemName}`}
                  className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {item.itemName}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.price} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.restaurantSlug,
                          item.itemName,
                          item.quantity - 1
                        )
                      }
                      className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.restaurantSlug,
                          item.itemName,
                          item.quantity + 1
                        )
                      }
                      className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-slate-900 dark:text-white">Total</span>
              <span className="text-lg font-semibold text-primary">
                ₱{totalPhp.toLocaleString()}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full text-center bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Proceed to checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";

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
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            Your order ({itemCount} {itemCount === 1 ? "item" : "items"})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Your cart is empty</p>
              <p className="text-sm mt-1">Add items from a restaurant menu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.restaurantSlug}-${item.itemName}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {item.itemName}
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
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
                      className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
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
                      className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600"
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
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-slate-900 dark:text-white">
                Total
              </span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                ₱{totalPhp.toLocaleString()}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Proceed to checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, History, Loader2, RotateCcw, MapPin, Gift, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { getSlugByRestaurantName, getIsGroceryBySlug } from "@/data/combined";

const STATUS_LABELS: Record<string, string> = {
  pending: "Order received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  assigned: "Driver assigned",
  picked: "Picked up",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

type HistoryOrder = {
  id: string;
  status: string;
  totalPhp: number;
  createdAt: string;
  landmark: string;
  estimatedDeliveryAt: string | null;
  items: { restaurant_name: string; item_name: string; price: string; quantity: number }[];
};

export default function OrderHistoryPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [error, setError] = useState("");
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phone.trim() || phone.replace(/\D/g, "").length < 4) {
      setError("Enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const [historyRes, loyaltyRes, referralRes] = await Promise.all([
        fetch(`/api/orders/history?phone=${encodeURIComponent(phone.trim())}`),
        fetch(`/api/loyalty?phone=${encodeURIComponent(phone.trim())}`),
        fetch(`/api/referral?phone=${encodeURIComponent(phone.trim())}`),
      ]);
      const historyData = await historyRes.json();
      const loyaltyData = await loyaltyRes.json();
      const referralData = await referralRes.json();
      setOrders(historyData.orders || []);
      setLoyaltyPoints(loyaltyData.points ?? 0);
      setReferralCode(referralData.code ?? null);
    } catch {
      setError("Could not load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function handleReorder(order: HistoryOrder) {
    setReorderingId(order.id);
    clearCart();
    let success = true;
    for (const item of order.items) {
      const slug = getSlugByRestaurantName(item.restaurant_name) ?? item.restaurant_name.toLowerCase().replace(/\s+/g, "-");
      const ok = addItem({
        restaurantName: item.restaurant_name,
        restaurantSlug: slug,
        itemName: item.item_name,
        price: item.price,
        quantity: item.quantity,
        isGrocery: getIsGroceryBySlug(slug),
      });
      if (!ok) success = false;
    }
    setReorderingId(null);
    if (success) {
      router.push("/checkout");
    } else {
      setError("Some items could not be added (max 1 restaurant + 1 grocery per order). Try reordering from a single restaurant.");
    }
  }

  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <History className="w-4 h-5 text-primary" />
          Order history
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Enter your phone number to see past orders and reorder.
        </p>

        <form onSubmit={handleLookup} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09XX XXX XXXX"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-70 transition-opacity flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              "View orders"
            )}
          </button>
        </form>

        {(loyaltyPoints != null || referralCode) && (
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            {loyaltyPoints != null && loyaltyPoints > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
                <Gift className="w-10 h-10 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{loyaltyPoints} points</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Earn 10 points per delivered order</p>
                </div>
              </div>
            )}
            {referralCode && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
                <Share2 className="w-10 h-10 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Refer friends</p>
                  <p className="text-sm font-mono text-slate-600 dark:text-slate-400">{referralCode}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-slate-500">{String(o.id).slice(0, 8)}…</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {o.landmark}
                    </p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-2">
                      ₱{Number(o.totalPhp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      o.status === "delivered"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : o.status === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(o.createdAt).toLocaleString("en-PH", {
                    timeZone: "Asia/Manila",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
                <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                  {o.items.map((i, idx) => (
                    <li key={idx}>
                      {i.item_name} × {i.quantity} — {i.price}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/track?id=${o.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Track
                  </Link>
                  {o.status !== "cancelled" && (
                    <button
                      onClick={() => handleReorder(o)}
                      disabled={reorderingId === o.id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {reorderingId === o.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && phone.length >= 4 && (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            No orders found for this phone number.
          </p>
        )}
      </div>
    </main>
  );
}

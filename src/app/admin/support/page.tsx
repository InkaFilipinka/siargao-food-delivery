"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, Package, Phone, ArrowRight } from "lucide-react";
import { SUPPORT_WHATSAPP } from "@/config/support";

const STAFF_TOKEN_KEY = "siargao-staff-token";

type Order = {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  landmark: string;
  deliveryAddress: string;
  totalPhp: number;
  timeWindow: string;
  scheduledAt: string | null;
  createdAt: string;
  items: { restaurant_name: string; item_name: string; price: string; quantity: number }[];
};

function formatTime(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AdminSupportPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrders([]);
    if (!query.trim()) return;
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem(STAFF_TOKEN_KEY) : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(
        `/api/orders/search?q=${encodeURIComponent(query.trim())}`,
        { headers }
      );
      const data = await res.json();
      if (res.status === 401) {
        setError("Please sign in at Staff page first.");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Search failed");
        return;
      }
      setOrders(data.orders || []);
    } catch {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Customer support
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Search orders by phone number or order ID
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Phone (09XX...) or Order ID"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
            minLength={3}
          />
        </div>
        <button
          type="submit"
          disabled={loading || query.trim().length < 3}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          Search
        </button>
      </form>

      {error && (
        <p className="text-amber-600 dark:text-amber-400">{error}</p>
      )}

      {orders.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Found {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {orders.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
                    {o.id}
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {o.customerName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {o.landmark}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {o.timeWindow === "scheduled" && o.scheduledAt
                      ? formatTime(o.scheduledAt)
                      : "ASAP"}{" "}
                    · ₱{Number(o.totalPhp).toLocaleString()} · {o.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${o.customerPhone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    Support
                  </a>
                  <Link
                    href={`/staff/orders?highlight=${o.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90"
                  >
                    Manage
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && query.trim().length >= 3 && orders.length === 0 && !error && (
        <p className="text-slate-500 dark:text-slate-400">
          No orders found. Try a different search.
        </p>
      )}

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <Link
          href="/staff/orders"
          className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
        >
          <Package className="w-4 h-4" />
          Full order list on Staff page
        </Link>
      </div>
    </div>
  );
}

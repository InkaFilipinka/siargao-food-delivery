"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Check,
  X,
  Clock,
  MapPin,
  Lock,
  UtensilsCrossed,
  BarChart3,
  Settings,
  ToggleLeft,
  ToggleRight,
  MessageCircle,
  Phone,
} from "lucide-react";
import { combinedRestaurants, getRestaurantBySlug } from "@/data/combined";
import { cn } from "@/lib/utils";

const STAFF_TOKEN_KEY = "siargao-staff-token";
const RESTAURANT_TOKEN_KEY = "siargao-restaurant-token";
const RESTAURANT_SLUG_KEY = "siargao-restaurant-slug";
const PREP_OPTIONS = [5, 10, 20, 30, 45];

type Order = {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string | null;
  landmark: string;
  deliveryAddress: string;
  totalPhp: number;
  timeWindow: string;
  scheduledAt: string | null;
  createdAt: string;
  items: { item_name: string; price: string; quantity: number }[];
  restaurantStatus: string;
  prepMins: number | null;
};

function toWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("0") ? `63${digits.slice(1)}` : digits.startsWith("63") ? digits : `63${digits}`;
  return `https://wa.me/${num}`;
}

function formatTime(s: string) {
  return new Date(s).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function RestaurantPortalPage() {
  const [slug, setSlug] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<{ name: string; slug: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [staffToken, setStaffTokenState] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"restaurant" | "staff">("restaurant");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [selectedPrep, setSelectedPrep] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<"orders" | "availability" | "earnings" | "analytics" | "settings">("orders");
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [togglingItem, setTogglingItem] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<{
    pendingPhp: number;
    paidTotalPhp: number;
    payouts: { id: string; amountPhp: number; paidAt: string; orderIds: string[] }[];
  } | null>(null);
  const [analytics, setAnalytics] = useState<{
    byDay: { date: string; ordersCount: number; revenuePhp: number }[];
    totalOrders: number;
    totalRevenuePhp: number;
  } | null>(null);
  const [settings, setSettings] = useState<{ hours: string | null; minOrderPhp: number | null } | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const restaurantToken = sessionStorage.getItem(RESTAURANT_TOKEN_KEY);
    if (restaurantToken) return { Authorization: `Bearer ${restaurantToken}` };
    const staffToken = sessionStorage.getItem(STAFF_TOKEN_KEY);
    if (staffToken) return { Authorization: `Bearer ${staffToken}` };
    return {};
  }, []);

  const loadOrders = useCallback(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    setNeedsAuth(false);
    fetch(`/api/restaurant/orders?slug=${encodeURIComponent(slug)}`, {
      headers: getAuthHeaders(),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          sessionStorage.removeItem(STAFF_TOKEN_KEY);
          sessionStorage.removeItem(RESTAURANT_TOKEN_KEY);
          sessionStorage.removeItem(RESTAURANT_SLUG_KEY);
          setNeedsAuth(true);
          return { orders: [], restaurant: null };
        }
        if (!res.ok) {
          setError(data.error || "Failed to load");
          return { orders: [], restaurant: null };
        }
        return data;
      })
      .then((data) => {
        setOrders(data.orders || []);
        setRestaurant(data.restaurant || null);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [slug, getAuthHeaders]);

  useEffect(() => {
    const savedSlug = typeof window !== "undefined" ? sessionStorage.getItem(RESTAURANT_SLUG_KEY) : null;
    if (savedSlug && !slug) setSlug(savedSlug);
  }, []);

  const loadEarnings = useCallback(() => {
    if (!slug) return;
    fetch(`/api/restaurant/earnings?slug=${encodeURIComponent(slug)}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => setEarnings({ pendingPhp: d.pendingPhp ?? 0, paidTotalPhp: d.paidTotalPhp ?? 0, payouts: d.payouts ?? [] }))
      .catch(() => setEarnings(null));
  }, [slug, getAuthHeaders]);

  useEffect(() => {
    if (slug) {
      loadOrders();
      fetch(`/api/restaurant/items/availability?slug=${encodeURIComponent(slug)}`)
        .then((res) => res.json())
        .then((d) => setAvailability(d.availability || {}))
        .catch(() => setAvailability({}));
      loadEarnings();
      fetch(`/api/restaurant/analytics?slug=${encodeURIComponent(slug)}&days=14`, { headers: getAuthHeaders() })
        .then((res) => res.json())
        .then((d) => setAnalytics(d.byDay ? { byDay: d.byDay, totalOrders: d.totalOrders ?? 0, totalRevenuePhp: d.totalRevenuePhp ?? 0 } : null))
        .catch(() => setAnalytics(null));
      fetch(`/api/restaurant/settings?slug=${encodeURIComponent(slug)}`, { headers: getAuthHeaders() })
        .then((res) => res.json())
        .then((d) => setSettings({ hours: d.hours ?? null, minOrderPhp: d.minOrderPhp ?? null }))
        .catch(() => setSettings(null));
    } else {
      setOrders([]);
      setRestaurant(null);
      setAvailability({});
      setEarnings(null);
      setAnalytics(null);
      setSettings(null);
    }
  }, [slug, loadOrders, loadEarnings]);

  useEffect(() => {
    if (!slug || needsAuth) return;
    const id = setInterval(loadOrders, 30000);
    return () => clearInterval(id);
  }, [slug, needsAuth, loadOrders]);

  async function handleAccept(orderId: string) {
    const prep = selectedPrep[orderId] ?? 15;
    setAcceptingId(orderId);
    try {
      const res = await fetch(`/api/restaurant/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() } as HeadersInit,
        body: JSON.stringify({ slug, action: "accept", prepMins: prep }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      loadOrders();
    } catch {
      setError("Failed to accept");
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleReject(orderId: string) {
    setAcceptingId(orderId);
    try {
      const res = await fetch(`/api/restaurant/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() } as HeadersInit,
        body: JSON.stringify({ slug, action: "reject" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      loadOrders();
    } catch {
      setError("Failed to reject");
    } finally {
      setAcceptingId(null);
    }
  }

  async function toggleAvailability(itemName: string, available: boolean) {
    if (!slug) return;
    setTogglingItem(itemName);
    try {
      const res = await fetch("/api/restaurant/items/availability", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        } as HeadersInit,
        body: JSON.stringify({ slug, itemName, available }),
      });
      if (!res.ok) throw new Error("Failed");
      setAvailability((a) => ({ ...a, [itemName]: available }));
    } catch {
      setError("Failed to update availability");
    } finally {
      setTogglingItem(null);
    }
  }

  async function handleRestaurantLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) return;
    try {
      const res = await fetch("/api/auth/restaurant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      sessionStorage.setItem(RESTAURANT_TOKEN_KEY, data.token);
      sessionStorage.setItem(RESTAURANT_SLUG_KEY, data.slug);
      setSlug(data.slug);
      setLoginPassword("");
      setNeedsAuth(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault();
    const token = staffToken.trim();
    if (!token) return;
    sessionStorage.setItem(STAFF_TOKEN_KEY, token);
    setStaffTokenState("");
    setNeedsAuth(false);
    if (slug) loadOrders();
  }

  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <UtensilsCrossed className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Restaurant portal
          </h1>
        </div>

        {needsAuth && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-slate-500" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Sign in</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setLoginMode("restaurant")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  loginMode === "restaurant"
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Restaurant login
              </button>
              <button
                type="button"
                onClick={() => setLoginMode("staff")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  loginMode === "staff"
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Staff token
              </button>
            </div>
            {loginMode === "restaurant" ? (
              <form onSubmit={handleRestaurantLogin} className="space-y-3">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Sign in
                </button>
              </form>
            ) : (
              <form onSubmit={handleStaffLogin} className="space-y-3">
                <input
                  type="password"
                  value={staffToken}
                  onChange={(e) => setStaffTokenState(e.target.value)}
                  placeholder="Staff token"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Sign in
                </button>
                <p className="text-xs text-slate-500">
                  Then select your restaurant below.
                </p>
              </form>
            )}
            {error && <p className="text-sm text-amber-600 mt-2">{error}</p>}
          </div>
        )}

        {!needsAuth && (
          <>
            <div className="flex gap-3 mb-6">
              <select
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
              >
                <option value="">Select restaurant</option>
                {combinedRestaurants.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.name}
                  </option>
                ))}
              </select>
              {slug && (
                <button
                  onClick={loadOrders}
                  disabled={loading}
                  className="px-4 py-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  Refresh
                </button>
              )}
            </div>

            {error && (
              <p className="text-amber-600 dark:text-amber-400 mb-4">{error}</p>
            )}

            {slug && restaurant && (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setTab("orders")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      tab === "orders"
                        ? "bg-primary text-primary-foreground"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => setTab("availability")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      tab === "availability"
                        ? "bg-primary text-primary-foreground"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Availability
                  </button>
                  <button
                    onClick={() => setTab("earnings")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      tab === "earnings"
                        ? "bg-primary text-primary-foreground"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Earnings
                  </button>
                  <button
                    onClick={() => setTab("analytics")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      tab === "analytics"
                        ? "bg-primary text-primary-foreground"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => setTab("settings")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      tab === "settings"
                        ? "bg-primary text-primary-foreground"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Settings
                  </button>
                </div>

                {tab === "analytics" && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 mb-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Analytics (last 14 days)
                    </h3>
                    {analytics ? (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Orders</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{analytics.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Revenue</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">₱{analytics.totalRevenuePhp?.toLocaleString() ?? "0"}</p>
                          </div>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {analytics.byDay?.filter((d) => d.ordersCount > 0 || d.revenuePhp > 0).map((d) => (
                            <div key={d.date} className="flex justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-700">
                              <span className="text-slate-700 dark:text-slate-300">{new Date(d.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                              <span>{d.ordersCount} orders · ₱{d.revenuePhp.toLocaleString()}</span>
                            </div>
                          )) ?? null}
                          {(!analytics.byDay || analytics.byDay.every((d) => d.ordersCount === 0 && d.revenuePhp === 0)) && (
                            <p className="text-sm text-slate-500">No orders in this period.</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">Loading analytics…</p>
                    )}
                  </div>
                )}
                {tab === "settings" && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 mb-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Restaurant settings
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">Override displayed hours and minimum order. Leave blank to use defaults.</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hours (e.g. 08:00-22:00)</label>
                        <input
                          type="text"
                          value={settings?.hours ?? ""}
                          onChange={(e) => setSettings((s) => ({ hours: e.target.value || null, minOrderPhp: s?.minOrderPhp ?? null }))}
                          placeholder="08:00-22:00"
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min order (₱)</label>
                        <input
                          type="number"
                          min={0}
                          value={settings?.minOrderPhp ?? ""}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            setSettings((s) => ({ hours: s?.hours ?? null, minOrderPhp: e.target.value === "" || isNaN(v) ? null : v }));
                          }}
                          placeholder="e.g. 100"
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (!slug) return;
                          setSettingsSaving(true);
                          try {
                            const res = await fetch("/api/restaurant/settings", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json", ...getAuthHeaders() } as HeadersInit,
                              body: JSON.stringify({
                                slug,
                                hours: settings?.hours ?? null,
                                minOrderPhp: settings?.minOrderPhp ?? null,
                              }),
                            });
                            if (!res.ok) throw new Error("Failed");
                          } catch {
                            setError("Failed to save settings");
                          } finally {
                            setSettingsSaving(false);
                          }
                        }}
                        disabled={settingsSaving}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-70"
                      >
                        {settingsSaving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                )}
                {tab === "earnings" && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 mb-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                      Earnings
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Pending (2h after delivery)</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                          ₱{earnings?.pendingPhp?.toLocaleString() ?? "0"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Paid total</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                          ₱{earnings?.paidTotalPhp?.toLocaleString() ?? "0"}
                        </p>
                      </div>
                    </div>
                    {earnings?.payouts?.length ? (
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Payment history</p>
                        <ul className="space-y-2">
                          {earnings.payouts.map((p) => (
                            <li key={p.id} className="flex justify-between text-sm">
                              <span>₱{p.amountPhp?.toLocaleString()}</span>
                              <span className="text-slate-500">
                                {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-PH") : "—"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No payouts yet.</p>
                    )}
                  </div>
                )}
                {tab === "availability" && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 mb-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Toggle items sold out
                    </h3>
                    <div className="space-y-2">
                      {getRestaurantBySlug(slug)?.menuItems.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                        >
                          <span className="text-slate-900 dark:text-white">{item.name}</span>
                          <button
                            onClick={() =>
                              toggleAvailability(
                                item.name,
                                availability[item.name] === false
                              )
                            }
                            disabled={togglingItem === item.name}
                            className="flex items-center gap-2 text-sm font-medium"
                          >
                            {togglingItem === item.name ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : availability[item.name] === false ? (
                              <>
                                <ToggleLeft className="w-6 h-6 text-amber-500" />
                                Sold out
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-6 h-6 text-green-600" />
                                Available
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "orders" && (
                  <>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Orders for <span className="font-medium text-slate-700 dark:text-slate-300">{restaurant.name}</span>
                </p>

                {loading && orders.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 py-8 text-center">
                    No orders for this restaurant.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                              {String(o.id).slice(0, 8)}…
                            </p>
                            <p className="font-medium text-slate-900 dark:text-white mt-1">
                              {o.customerName}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-4 h-4 shrink-0" />
                              {o.landmark}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {o.timeWindow === "scheduled" && o.scheduledAt
                                ? formatTime(o.scheduledAt)
                                : "ASAP"}
                              {" · "}
                              {formatTime(o.createdAt)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(o.customerWhatsapp || o.customerPhone) && (
                                <>
                                  {o.customerWhatsapp && (
                                    <a
                                      href={toWhatsAppUrl(o.customerWhatsapp)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      WhatsApp: {o.customerWhatsapp}
                                    </a>
                                  )}
                                  {o.customerPhone && (
                                    <a
                                      href={`tel:${o.customerPhone}`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                      Call: {o.customerPhone}
                                    </a>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium shrink-0",
                              o.restaurantStatus === "accepted"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : o.restaurantStatus === "rejected"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            )}
                          >
                            {o.restaurantStatus === "accepted" && o.prepMins
                              ? `${o.prepMins} min`
                              : o.restaurantStatus}
                          </span>
                        </div>

                        <ul className="mt-3 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          {o.items.map((i, idx) => (
                            <li key={idx}>
                              {i.item_name} × {i.quantity} — {i.price}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                          ₱{Number(o.totalPhp).toLocaleString()} total (order)
                        </p>

                        {o.restaurantStatus === "pending" && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <select
                              value={selectedPrep[o.id] ?? 15}
                              onChange={(e) =>
                                setSelectedPrep((p) => ({
                                  ...p,
                                  [o.id]: Number(e.target.value),
                                }))
                              }
                              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                            >
                              {PREP_OPTIONS.map((m) => (
                                <option key={m} value={m}>
                                  {m} min prep
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAccept(o.id)}
                              disabled={acceptingId === o.id}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              {acceptingId === o.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(o.id)}
                              disabled={acceptingId === o.id}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

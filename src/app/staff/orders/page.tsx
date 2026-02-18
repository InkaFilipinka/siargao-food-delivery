"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  List,
  PenLine,
  MapPin,
  Phone,
  MessageCircle,
  ChevronDown,
  Lock,
  ExternalLink,
  Headphones,
  Columns3,
} from "lucide-react";
import { SUPPORT_WHATSAPP } from "@/config/support";
import { DispatchBoard } from "@/components/dispatch-board";
import { cn } from "@/lib/utils";

const STAFF_TOKEN_KEY = "siargao-staff-token";
const POLL_INTERVAL_MS = 30000;

const STATUS_OPTIONS = [
  "confirmed",
  "preparing",
  "ready",
  "assigned",
  "picked",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

function toWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("0") ? `63${digits.slice(1)}` : digits.startsWith("63") ? digits : `63${digits}`;
  return `https://wa.me/${num}`;
}

type Order = {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string | null;
  landmark: string;
  deliveryAddress: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  totalPhp: number;
  timeWindow: string;
  updatedBy?: string | null;
  scheduledAt: string | null;
  createdAt: string;
  items: { restaurant_name: string; item_name: string; price: string; quantity: number }[];
};

export default function StaffOrdersPage() {
  const [view, setView] = useState<"list" | "board" | "update">("list");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [staffToken, setStaffTokenState] = useState("");
  const [orderId, setOrderId] = useState("");
  const [newStatus, setNewStatus] = useState("confirmed");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem(STAFF_TOKEN_KEY) : null;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, []);

  const loadOrders = useCallback(() => {
    setOrdersLoading(true);
    setOrdersError(null);
    setNeedsAuth(false);
    fetch("/api/orders", { headers: { "Content-Type": "application/json", ...getAuthHeaders() } })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          sessionStorage.removeItem(STAFF_TOKEN_KEY);
          setNeedsAuth(true);
          return { orders: [] };
        }
        if (res.status === 503) {
          setOrdersError(data.error || "Database not configured");
          return { orders: [] };
        }
        if (!res.ok) {
          setOrdersError(data.error || "Failed to load orders");
          return { orders: [] };
        }
        return data;
      })
      .then((data) => setOrders(data.orders || []))
      .catch(() => {
        setOrdersError("Failed to load orders");
        setOrders([]);
      })
      .finally(() => setOrdersLoading(false));
  }, [getAuthHeaders]);

  function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault();
    const token = staffToken.trim();
    if (!token) return;
    sessionStorage.setItem(STAFF_TOKEN_KEY, token);
    setStaffTokenState("");
    setNeedsAuth(false);
    loadOrders();
  }

  function handleStaffLogout() {
    sessionStorage.removeItem(STAFF_TOKEN_KEY);
    setNeedsAuth(true);
    setOrders([]);
  }

  useEffect(() => {
    if (view === "list" || view === "board") loadOrders();
  }, [view, loadOrders]);

  useEffect(() => {
    if ((view !== "list" && view !== "board") || needsAuth) return;
    const id = setInterval(loadOrders, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [view, needsAuth, loadOrders]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim()) return;
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId.trim()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() } as HeadersInit,
        body: JSON.stringify({ status: newStatus, source: "staff" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage({ type: "ok", text: `Order updated to ${newStatus}` });
      setOrderId("");
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() } as HeadersInit,
        body: JSON.stringify({ status, source: "staff" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    } catch {
      // silent fail; could add toast
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const formatTime = (s: string | null) => {
    if (!s) return "—";
    return new Date(s).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Staff: Orders
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView("list")}
              className={cn(
                "px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium",
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setView("board")}
              className={cn(
                "px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium",
                view === "board"
                  ? "bg-primary text-primary-foreground"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}
            >
              <Columns3 className="w-4 h-4" />
              Dispatch board
            </button>
            <button
              onClick={() => setView("update")}
              className={cn(
                "px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium",
                view === "update"
                  ? "bg-primary text-primary-foreground"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}
            >
              <PenLine className="w-4 h-4" />
              Update by ID
            </button>
          </div>
        </div>

        {view === "list" && needsAuth && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-slate-500" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Staff access required</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Enter the staff token to view and manage orders.
            </p>
            <form onSubmit={handleStaffLogin} className="space-y-3">
              <input
                type="password"
                value={staffToken}
                onChange={(e) => setStaffTokenState(e.target.value)}
                placeholder="Staff token"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign in
              </button>
            </form>
          </div>
        )}

        {view === "board" && !needsAuth && (
          <>
            <div className="flex gap-4 mb-4 items-center">
              <button
                onClick={loadOrders}
                disabled={ordersLoading}
                className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                {ordersLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400">Auto-refresh every 30s</span>
            </div>
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : ordersError ? (
              <p className="text-amber-600 dark:text-amber-400 py-8 text-center">{ordersError}</p>
            ) : (
              <DispatchBoard
                orders={orders}
                onStatusChange={updateOrderStatus}
                updatingId={updatingId}
                getAuthHeaders={getAuthHeaders}
              />
            )}
          </>
        )}

        {view === "list" && !needsAuth && (
          <>
            <div className="flex items-center gap-4 mb-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <button
                onClick={loadOrders}
                disabled={ordersLoading}
                className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                {ordersLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400">Auto-refresh every 30s</span>
              <button
                onClick={handleStaffLogout}
                className="ml-auto px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
              >
                Sign out
              </button>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : ordersError ? (
              <p className="text-amber-600 dark:text-amber-400 py-8 text-center">
                {ordersError}
              </p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 py-8 text-center">
                No orders found.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === o.id ? null : o.id)
                      }
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                          {String(o.id).slice(0, 8)}…
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white truncate">
                          {o.customerName}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          ₱{Number(o.totalPhp).toLocaleString()}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            o.status === "delivered"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : o.status === "cancelled"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          )}
                        >
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-slate-400 shrink-0 transition-transform",
                          expandedId === o.id && "rotate-180"
                        )}
                      />
                    </button>
                    {expandedId === o.id && (
                      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4 shrink-0" />
                          {o.landmark}
                          {o.deliveryAddress && o.deliveryAddress !== "See landmark" && (
                            <span> · {o.deliveryAddress}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          {(o.customerWhatsapp || o.customerPhone) && (
                            <>
                              <a
                                href={toWhatsAppUrl(o.customerWhatsapp || o.customerPhone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-green-600 hover:underline font-medium"
                              >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                              </a>
                              {o.customerPhone && (
                                <a
                                  href={`tel:${o.customerPhone}`}
                                  className="flex items-center gap-2 text-orange-600 hover:underline"
                                >
                                  <Phone className="w-4 h-4" />
                                  Call: {o.customerPhone}
                                </a>
                              )}
                            </>
                          )}
                          {o.deliveryLat != null && o.deliveryLng != null && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${o.deliveryLat},${o.deliveryLng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-orange-600 hover:underline"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Open in Google Maps
                            </a>
                          )}
                          <a
                            href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-orange-600"
                          >
                            <Headphones className="w-4 h-4" />
                            Contact customer support
                          </a>
                        </div>
                        <ul className="text-sm text-slate-600 dark:text-slate-400">
                          {o.items.map((i, idx) => (
                            <li key={idx}>
                              {i.item_name} x{i.quantity} — {i.price}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-slate-500">
                          {o.timeWindow === "scheduled" && o.scheduledAt
                            ? `Scheduled: ${formatTime(o.scheduledAt)}`
                            : "ASAP"}
                          {" · "}
                          {formatTime(o.createdAt)}
                          {o.updatedBy && (
                            <span className="ml-2 text-slate-400">
                              · last by {o.updatedBy}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Update status:
                          </span>
                          <select
                            value={o.status}
                            onChange={(e) =>
                              updateOrderStatus(o.id, e.target.value)
                            }
                            disabled={updatingId === o.id}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                          {updatingId === o.id && (
                            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "update" && (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Enter order ID and select new status. Use{" "}
              <Link
                href="/track"
                className="text-orange-600 hover:underline"
              >
                Track
              </Link>{" "}
              to look up orders.
            </p>
            <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Order ID
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. abc123-def456-..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  New status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              {message && (
                <p
                  className={
                    message.type === "ok"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500"
                  }
                >
                  {message.text}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-70 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Update status
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  MapPin,
  ExternalLink,
  Home,
  Banknote,
  DollarSign,
  Lock,
  Package,
  Navigation,
  ToggleLeft,
  ToggleRight,
  MessageCircle,
  ChevronDown,
  Send,
} from "lucide-react";
import { DeliveryMap } from "@/components/delivery-map";

const STAFF_TOKEN_KEY = "siargao-staff-token";
const DRIVER_TOKEN_KEY = "siargao-driver-token";
const DRIVER_STATUSES = ["ready", "assigned", "picked", "out_for_delivery"];
const POLL_INTERVAL_MS = 30000;

type Order = {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  landmark: string;
  deliveryAddress: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  totalPhp: number;
  tipPhp: number;
  arrivedAtHubAt?: string | null;
  cashReceivedByDriver?: number | null;
  cashTurnedIn?: number | null;
  driverLat?: number | null;
  driverLng?: number | null;
  driverLocationUpdatedAt?: string | null;
  createdAt: string;
  items: { item_name: string; price: string; quantity: number }[];
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

export default function DriverPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [staffToken, setStaffTokenState] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"driver" | "staff">("driver");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [cashModal, setCashModal] = useState<Order | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [cashTurnedIn, setCashTurnedIn] = useState("");
  const [cashReason, setCashReason] = useState("");
  const [sharingLocation, setSharingLocation] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [liveDriverPos, setLiveDriverPos] = useState<{ lat: number; lng: number } | null>(null);
  const [messagesExpandedId, setMessagesExpandedId] = useState<string | null>(null);
  const [orderMessages, setOrderMessages] = useState<Record<string, { id: string; sender_type: string; message: string; created_at: string }[]>>({});
  const [orderReplyInput, setOrderReplyInput] = useState<Record<string, string>>({});
  const [messagesLoadingId, setMessagesLoadingId] = useState<string | null>(null);
  const [sendingMessageId, setSendingMessageId] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSendRef = useRef<number>(0);
  const LOCATION_SEND_INTERVAL_MS = 15000;

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const driverToken = sessionStorage.getItem(DRIVER_TOKEN_KEY);
    if (driverToken) return { Authorization: `Bearer ${driverToken}` };
    const staffToken = sessionStorage.getItem(STAFF_TOKEN_KEY);
    if (staffToken) return { Authorization: `Bearer ${staffToken}` };
    return {};
  }, []);

  const loadOrders = useCallback(() => {
    setLoading(true);
    setError("");
    setNeedsAuth(false);
    fetch("/api/orders", { headers: getAuthHeaders() })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          sessionStorage.removeItem(STAFF_TOKEN_KEY);
          sessionStorage.removeItem(DRIVER_TOKEN_KEY);
          setNeedsAuth(true);
          return { orders: [] };
        }
        if (!res.ok) return { orders: [] };
        return data;
      })
      .then((data) => {
        const all = (data.orders || []).filter((o: Order) =>
          DRIVER_STATUSES.includes(o.status)
        );
        setOrders(all);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [getAuthHeaders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (needsAuth) return;
    const id = setInterval(loadOrders, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [needsAuth, loadOrders]);

  const outForDeliveryOrders = useMemo(
    () => orders.filter((o) => o.status === "out_for_delivery"),
    [orders]
  );
  const outForDeliveryIds = useMemo(
    () => outForDeliveryOrders.map((o) => o.id).sort().join(","),
    [outForDeliveryOrders]
  );
  useEffect(() => {
    if (needsAuth || outForDeliveryOrders.length === 0 || !navigator.geolocation) return;
    const ofdOrders = [...outForDeliveryOrders];
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLiveDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const now = Date.now();
        if (now - lastSendRef.current < LOCATION_SEND_INTERVAL_MS) return;
        lastSendRef.current = now;
        const headers = getAuthHeaders();
        ofdOrders.forEach((o) => {
          fetch(`/api/orders/${o.id}/driver-location`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            } as HeadersInit,
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          }).catch(() => {});
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    watchIdRef.current = watchId;
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setLiveDriverPos(null);
    };
  }, [needsAuth, getAuthHeaders, outForDeliveryIds]);

  async function updateOrder(
    orderId: string,
    payload: {
      status?: string;
      arrivedAtHub?: boolean;
      driverArrived?: boolean;
      cashReceived?: number;
      cashTurnedIn?: number;
      cashVarianceReason?: string;
    }
  ) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        } as HeadersInit,
        body: JSON.stringify({ ...payload, source: "driver" }),
      });
      if (!res.ok) throw new Error("Failed");
      loadOrders();
      setCashModal(null);
    } catch {
      setError("Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  const [earnings, setEarnings] = useState<{
    todayPhp: number;
    allTimePhp: number;
    paidTotalPhp: number;
    payouts: { id: string; amountPhp: number; paidAt: string }[];
  } | null>(null);
  useEffect(() => {
    if (needsAuth) return;
    fetch("/api/driver/earnings", { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) =>
        setEarnings({
          todayPhp: data.todayPhp ?? 0,
          allTimePhp: data.allTimePhp ?? 0,
          paidTotalPhp: data.paidTotalPhp ?? 0,
          payouts: data.payouts ?? [],
        })
      )
      .catch(() => setEarnings(null));
  }, [needsAuth, getAuthHeaders, orders]);

  useEffect(() => {
    if (needsAuth) return;
    fetch("/api/driver/availability", { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => setIsAvailable(d.isAvailable ?? true))
      .catch(() => setIsAvailable(true));
  }, [needsAuth, getAuthHeaders]);

  async function toggleAvailability() {
    setTogglingAvailability(true);
    try {
      const res = await fetch("/api/driver/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() } as HeadersInit,
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });
      const data = await res.json();
      if (res.ok && typeof data.isAvailable === "boolean") {
        setIsAvailable(data.isAvailable);
      }
    } catch {
      setError("Failed to update availability");
    } finally {
      setTogglingAvailability(false);
    }
  }

  function loadOrderMessages(id: string) {
    setMessagesLoadingId(id);
    fetch(`/api/orders/${id}/messages`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => setOrderMessages((prev) => ({ ...prev, [id]: d.messages || [] })))
      .catch(() => setOrderMessages((prev) => ({ ...prev, [id]: [] })))
      .finally(() => setMessagesLoadingId(null));
  }

  async function sendOrderReply(orderId: string) {
    const text = (orderReplyInput[orderId] || "").trim();
    if (!text) return;
    setSendingMessageId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (res.ok && data) {
        setOrderMessages((prev) => ({
          ...prev,
          [orderId]: [...(prev[orderId] || []), data],
        }));
        setOrderReplyInput((prev) => ({ ...prev, [orderId]: "" }));
      }
    } finally {
      setSendingMessageId(null);
    }
  }

  useEffect(() => {
    if (messagesExpandedId && !needsAuth) {
      loadOrderMessages(messagesExpandedId);
    }
  }, [messagesExpandedId, needsAuth]);

  async function handleDriverLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) return;
    try {
      const res = await fetch("/api/auth/driver/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      sessionStorage.setItem(DRIVER_TOKEN_KEY, data.token);
      setLoginPassword("");
      setNeedsAuth(false);
      loadOrders();
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
    loadOrders();
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
          <Package className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Driver portal
          </h1>
        </div>

        {needsAuth && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 max-w-md">
            <Lock className="w-8 h-8 text-slate-400 mb-4" />
            <h2 className="font-semibold text-slate-900 dark:text-white mb-2">
              Sign in
            </h2>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setLoginMode("driver")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  loginMode === "driver"
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Driver login
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
            {loginMode === "driver" ? (
              <form onSubmit={handleDriverLogin} className="space-y-3">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg"
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
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg"
                >
                  Sign in
                </button>
              </form>
            )}
            {error && <p className="text-sm text-amber-600 mt-2">{error}</p>}
          </div>
        )}

        {!needsAuth && (
          <>
            <div className="mb-6 flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Availability</p>
                <p className="text-sm text-slate-500">You {isAvailable ? "are" : "are not"} receiving new orders</p>
              </div>
              <button
                onClick={toggleAvailability}
                disabled={togglingAvailability}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {togglingAvailability ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isAvailable ? (
                  <>
                    <ToggleRight className="w-6 h-6 text-green-600" />
                    <span className="text-green-600 dark:text-green-400">Online</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-6 h-6 text-slate-400" />
                    <span className="text-slate-500">Offline</span>
                  </>
                )}
              </button>
            </div>
            {earnings && (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Today</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ₱{earnings.todayPhp.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">All time</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ₱{earnings.allTimePhp.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Paid out</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ₱{earnings.paidTotalPhp.toLocaleString()}
                    </p>
                  </div>
                </div>
                {earnings.payouts?.length ? (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
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
                ) : null}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ready / Assigned / Picked / Out for delivery
              </p>
              <button
                onClick={loadOrders}
                disabled={loading}
                className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && <p className="text-amber-600 dark:text-amber-400 mb-4">{error}</p>}

            {loading && orders.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 py-8 text-center">
                No active deliveries.
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
                        <p className="font-mono text-xs text-slate-500">{String(o.id).slice(0, 8)}…</p>
                        <p className="font-medium text-slate-900 dark:text-white">{o.customerName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4 shrink-0" />
                          {o.landmark}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          ₱{Number(o.totalPhp).toLocaleString()} · {formatTime(o.createdAt)}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {o.deliveryLat != null && o.deliveryLng != null && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${o.deliveryLat},${o.deliveryLng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open in Google Maps
                        </a>
                      )}
                      {o.status === "assigned" && !o.arrivedAtHubAt && (
                        <button
                          onClick={() =>
                            updateOrder(o.id, { arrivedAtHub: true })
                          }
                          disabled={updatingId === o.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
                        >
                          {updatingId === o.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Home className="w-4 h-4" />
                          )}
                          Arrived at hub
                        </button>
                      )}
                      {o.status === "ready" && (
                        <button
                          onClick={() => updateOrder(o.id, { status: "assigned" })}
                          disabled={updatingId === o.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm font-medium disabled:opacity-50"
                        >
                          Mark assigned
                        </button>
                      )}
                      {o.status === "assigned" && (
                        <button
                          onClick={() => updateOrder(o.id, { status: "picked" })}
                          disabled={updatingId === o.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm font-medium disabled:opacity-50"
                        >
                          Picked up
                        </button>
                      )}
                      {o.status === "picked" && (
                        <button
                          onClick={() => updateOrder(o.id, { status: "out_for_delivery" })}
                          disabled={updatingId === o.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm font-medium disabled:opacity-50"
                        >
                          Out for delivery
                        </button>
                      )}
                      {o.status === "out_for_delivery" && (
                        <>
                          <button
                            onClick={async () => {
                              if (!navigator.geolocation) return;
                              setSharingLocation(o.id);
                              navigator.geolocation.getCurrentPosition(
                                async (pos) => {
                                  try {
                                    await fetch(`/api/orders/${o.id}/driver-location`, {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                        ...getAuthHeaders(),
                                      } as HeadersInit,
                                      body: JSON.stringify({
                                        lat: pos.coords.latitude,
                                        lng: pos.coords.longitude,
                                      }),
                                    });
                                  } finally {
                                    setSharingLocation(null);
                                  }
                                },
                                () => setSharingLocation(null)
                              );
                            }}
                            disabled={sharingLocation === o.id}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm font-medium disabled:opacity-50"
                          >
                            {sharingLocation === o.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Navigation className="w-4 h-4" />
                            )}
                            Share location
                          </button>
                          <button
                            onClick={() => updateOrder(o.id, { driverArrived: true })}
                            disabled={updatingId === o.id}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            I&apos;m here
                          </button>
                        </>
                      )}
                      {(o.status === "picked" || o.status === "out_for_delivery") && (
                        <button
                          onClick={() => updateOrder(o.id, { status: "delivered" })}
                          disabled={updatingId === o.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          Delivered
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setCashModal(o);
                          setCashReceived(String(o.cashReceivedByDriver ?? o.totalPhp ?? ""));
                          setCashTurnedIn(String(o.cashTurnedIn ?? ""));
                          setCashReason("");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium"
                      >
                        <Banknote className="w-4 h-4" />
                        Cash
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                      <button
                        onClick={() =>
                          setMessagesExpandedId(messagesExpandedId === o.id ? null : o.id)
                        }
                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Messages
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            messagesExpandedId === o.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {messagesExpandedId === o.id && (
                        <div className="mt-2">
                          {messagesLoadingId === o.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                          ) : (
                            <>
                              {(orderMessages[o.id] || []).length > 0 ? (
                                <ul className="space-y-2 mb-2 max-h-24 overflow-y-auto">
                                  {(orderMessages[o.id] || []).map((m) => (
                                    <li
                                      key={m.id}
                                      className={`text-xs p-2 rounded ${
                                        m.sender_type === "customer"
                                          ? "bg-slate-100 dark:bg-slate-700/50 mr-2"
                                          : "bg-primary/10 ml-2"
                                      }`}
                                    >
                                      <span className="text-slate-500">{m.sender_type}:</span> {m.message}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-slate-500 mb-2">No messages yet</p>
                              )}
                              <div className="flex gap-2">
                                <input
                                  value={orderReplyInput[o.id] || ""}
                                  onChange={(e) =>
                                    setOrderReplyInput((prev) => ({ ...prev, [o.id]: e.target.value }))
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && !e.shiftKey && sendOrderReply(o.id)
                                  }
                                  placeholder="Reply..."
                                  className="flex-1 px-2 py-1.5 rounded text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                                />
                                <button
                                  onClick={() => sendOrderReply(o.id)}
                                  disabled={
                                    sendingMessageId === o.id ||
                                    !(orderReplyInput[o.id] || "").trim()
                                  }
                                  className="p-1.5 rounded bg-primary text-primary-foreground disabled:opacity-50"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {o.status === "out_for_delivery" && o.deliveryLat != null && o.deliveryLng != null && (
                      <div className="mt-4">
                        <DeliveryMap
                          driverLat={liveDriverPos?.lat ?? o.driverLat ?? null}
                          driverLng={liveDriverPos?.lng ?? o.driverLng ?? null}
                          deliveryLat={o.deliveryLat}
                          deliveryLng={o.deliveryLng}
                          landmark={o.landmark}
                          lastUpdatedAt={o.driverLocationUpdatedAt}
                          showNavigateButton={true}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/staff/orders"
              className="block mt-8 text-center text-slate-600 dark:text-slate-400 hover:text-orange-600 text-sm"
            >
              Full order list (Staff)
            </Link>
          </>
        )}

        {cashModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Cash handling
              </h3>
              <p className="text-sm text-slate-500 mb-2">
                Order {String(cashModal.id).slice(0, 8)}… · ₱{Number(cashModal.totalPhp).toLocaleString()} expected
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Cash received from customer</label>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cash turned in at hub</label>
                  <input
                    type="number"
                    value={cashTurnedIn}
                    onChange={(e) => setCashTurnedIn(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Variance reason (if any)</label>
                  <input
                    type="text"
                    value={cashReason}
                    onChange={(e) => setCashReason(e.target.value)}
                    placeholder="Discount, change issue..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() =>
                    updateOrder(cashModal.id, {
                      cashReceived: parseFloat(cashReceived) || undefined,
                      cashTurnedIn: parseFloat(cashTurnedIn) || undefined,
                      cashVarianceReason: cashReason.trim() || undefined,
                    })
                  }
                  disabled={updatingId === cashModal.id}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setCashModal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

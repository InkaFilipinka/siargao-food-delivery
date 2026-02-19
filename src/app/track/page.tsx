"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, Package, MapPin, ExternalLink, Headphones, Clock, XCircle, CheckCircle, Star, MessageCircle, Send, Edit3 } from "lucide-react";
import { DeliveryMap } from "@/components/delivery-map";
import { getSlugByRestaurantName, getRestaurantBySlug } from "@/data/combined";
import { SUPPORT_WHATSAPP } from "@/config/support";

const STATUS_LABELS: Record<string, string> = {
  pending: "Order received",
  confirmed: "Confirmed & preparing",
  preparing: "Confirmed & preparing",
  ready: "Confirmed & preparing",
  assigned: "Confirmed & preparing",
  picked: "Confirmed & preparing",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_STEPS = ["pending", "preparing", "out_for_delivery", "delivered"];
const PREPARING_STATUSES = ["confirmed", "preparing", "ready", "assigned", "picked"];

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TrackPageContent() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");
  const [orderId, setOrderId] = useState(idFromUrl || "");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (idFromUrl) setOrderId(idFromUrl);
    const meta = sessionStorage.getItem("order-confirmation-meta");
    if (meta) {
      try {
        const { orderId: oid, phone: ph } = JSON.parse(meta);
        if (oid) setOrderId(oid);
        if (ph) setPhone(ph);
        sessionStorage.removeItem("order-confirmation-meta");
        if (oid && ph) {
          doSearch(oid, ph);
        }
      } catch {
        /* ignore */
      }
    }
  }, [idFromUrl]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [messages, setMessages] = useState<{ id: string; sender_type: string; message: string; created_at: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [showEditNotes, setShowEditNotes] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [showEditItems, setShowEditItems] = useState(false);
  const [editItems, setEditItems] = useState<{ restaurantName: string; restaurantSlug?: string; itemName: string; price: string; priceValue: number; quantity: number }[]>([]);
  const [editItemsSaving, setEditItemsSaving] = useState(false);

  function parsePrice(p: string): number {
    const m = (p || "").match(/[\d,.]+/);
    return m ? parseFloat(m[0].replace(/,/g, "")) : 0;
  }
  const [order, setOrder] = useState<{
    id: string;
    status: string;
    customerName: string;
    deliveryAddress: string;
    landmark: string;
    deliveryLat?: number | null;
    deliveryLng?: number | null;
    totalPhp: number;
    timeWindow: string;
    scheduledAt: string | null;
    createdAt: string;
    confirmedAt: string | null;
    readyAt: string | null;
    assignedAt: string | null;
    pickedAt: string | null;
    deliveredAt: string | null;
    estimatedDeliveryAt: string | null;
    cancelCutoffAt: string | null;
    driverArrivedAt: string | null;
    driverLat?: number | null;
    driverLng?: number | null;
    driverLocationUpdatedAt?: string | null;
    restaurantLat?: number | null;
    restaurantLng?: number | null;
    items: { item_name: string; quantity: number; price: string; restaurant_name: string; restaurant_slug?: string }[];
  } | null>(null);

  async function doSearch(overrideOrderId?: string, overridePhone?: string) {
    const oid = (overrideOrderId ?? orderId).trim();
    const ph = (overridePhone ?? phone).trim();
    if (!oid || !ph) return false;
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/${oid}?phone=${encodeURIComponent(ph)}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order not found");
      }

      setOrder(data);
      setEditNotes((data as { notes?: string })?.notes || "");
      const items = (data as { items?: { restaurant_name: string; restaurant_slug?: string; item_name: string; price: string; price_value?: number; quantity: number }[] })?.items || [];
      setEditItems(items.map((i) => ({
        restaurantName: i.restaurant_name,
        restaurantSlug: i.restaurant_slug,
        itemName: i.item_name,
        price: i.price,
        priceValue: i.price_value ?? parsePrice(i.price),
        quantity: i.quantity,
      })));
      if (data?.id && ph) {
        fetch(`/api/orders/${data.id}/messages?phone=${encodeURIComponent(ph)}`)
          .then((r) => r.json())
          .then((d) => setMessages(d.messages || []))
          .catch(() => {});
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find order");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      setError("Enter order ID and WhatsApp number");
      return;
    }
    await doSearch();
  }

  useEffect(() => {
    if (!order?.id || !phone.trim() || ["delivered", "cancelled"].includes(order.status)) return;
    const id = setInterval(() => {
      fetch(`/api/orders/${order.id}?phone=${encodeURIComponent(phone.trim())}`)
        .then((r) => r.json())
        .then((d) => setOrder((prev) => (prev ? { ...prev, ...d } : null)))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [order?.id, order?.status, phone]);

  async function handleCancel() {
    if (!order || !phone.trim()) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, phone: phone.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.status === "cancelled") {
        setOrder({ ...order, status: "cancelled" });
      } else {
        setError(data.error || "Could not cancel");
      }
    } catch {
      setError("Could not cancel");
    } finally {
      setCancelling(false);
    }
  }

  const canCancel =
    order &&
    order.status !== "cancelled" &&
    order.cancelCutoffAt &&
    new Date(order.cancelCutoffAt).getTime() > Date.now();

  const restaurantSlug =
    order && order.items.length > 0
      ? getSlugByRestaurantName(order.items[0].restaurant_name) ??
        order.items[0].restaurant_name.toLowerCase().replace(/\s+/g, "-")
      : null;

  async function handleSendMessage() {
    if (!order || !phone.trim() || !chatInput.trim()) return;
    setChatLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), message: chatInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data) {
        setMessages((prev) => [...prev, data]);
        setChatInput("");
      }
    } catch {
      setError("Could not send message");
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSubmitReview() {
    if (!order || !phone.trim() || !restaurantSlug || reviewRating < 1) return;
    setReviewLoading(true);
    try {
      const res = await fetch("/api/reviews/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug,
          orderId: order.id,
          phone: phone.trim(),
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      });
      if (res.ok) setReviewSubmitted(true);
    } catch {
      setError("Could not submit review");
    } finally {
      setReviewLoading(false);
    }
  }

  const currentStepIndex = order
    ? PREPARING_STATUSES.includes(order.status)
      ? 1
      : STATUS_STEPS.indexOf(order.status) >= 0
        ? STATUS_STEPS.indexOf(order.status)
        : -1
    : -1;

  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          ← Back
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Track your order
        </h1>

        <form onSubmit={handleSearch} className="space-y-4 mb-12">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. abc123-def456-..."
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              WhatsApp number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 9XX XXX XXXX or 09XX XXX XXXX"
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
                Looking up...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Track order
              </>
            )}
          </button>
        </form>

        {order && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Status: {STATUS_LABELS[order.status] || order.status}
              </h2>

              {order.estimatedDeliveryAt && order.status !== "delivered" && order.status !== "cancelled" && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Estimated delivery: {new Date(order.estimatedDeliveryAt).toLocaleString("en-PH", {
                      timeZone: "Asia/Manila",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              )}

              {order.driverArrivedAt && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>Driver has arrived at your location</span>
                </div>
              )}

              {canCancel && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium text-sm"
                  >
                    {cancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Cancel order
                  </button>
                  <button
                    onClick={() => setShowEditNotes(!showEditNotes)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit notes
                  </button>
                  <button
                    onClick={() => {
                      setShowEditItems(!showEditItems);
                      if (!showEditItems && order?.items) {
                        const items = order.items as { restaurant_name: string; restaurant_slug?: string; item_name: string; price: string; price_value?: number; quantity: number }[];
                        setEditItems(items.map((i) => ({
                          restaurantName: i.restaurant_name,
                          restaurantSlug: i.restaurant_slug,
                          itemName: i.item_name,
                          price: i.price,
                          priceValue: i.price_value ?? parsePrice(i.price),
                          quantity: i.quantity,
                        })));
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit items
                  </button>
                </div>
              )}
              {showEditItems && canCancel && (
                <div className="mb-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-3">Edit items</h3>
                  <p className="text-xs text-slate-500 mb-3">Add or remove items (within 5 min of placing)</p>
                  {editItems.map((it, idx) => (
                    <div key={`${it.restaurantName}-${it.itemName}-${idx}`} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                      <span className="text-sm text-slate-900 dark:text-white">{it.itemName} × {it.quantity} — {it.price}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditItems((prev) => prev.map((p, i) => i === idx ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p))}
                          className="w-7 h-7 rounded border border-slate-300 text-slate-600 flex items-center justify-center"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditItems((prev) => prev.map((p, i) => i === idx ? { ...p, quantity: p.quantity + 1 } : p))}
                          className="w-7 h-7 rounded border border-slate-300 text-slate-600 flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 text-sm ml-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {(() => {
                    const slugs = [...new Set(editItems.map((i) => i.restaurantSlug ?? getSlugByRestaurantName(i.restaurantName) ?? ""))].filter(Boolean);
                    const restaurants = slugs.map((s) => getRestaurantBySlug(s!)).filter(Boolean);
                    return restaurants.length > 0 ? (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Add item</p>
                        <select
                          onChange={(e) => {
                            const v = e.target.value;
                            if (!v) return;
                            const [restName, itemName, priceStr] = v.split("::");
                            const rest = restaurants.find((r) => r!.name === restName);
                            if (!rest) return;
                            const slug = rest.slug;
                            const priceVal = parsePrice(priceStr);
                            setEditItems((prev) => {
                              const existing = prev.find((i) => (i.restaurantSlug ?? getSlugByRestaurantName(i.restaurantName)) === slug && i.itemName === itemName);
                              if (existing) {
                                return prev.map((p) => p === existing ? { ...p, quantity: p.quantity + 1 } : p);
                              }
                              return [...prev, { restaurantName: restName, restaurantSlug: slug, itemName, price: priceStr, priceValue: priceVal, quantity: 1 }];
                            });
                            e.target.value = "";
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                        >
                          <option value="">Select item to add</option>
                          {restaurants.flatMap((r) =>
                            (r?.menuItems || []).map((m) => (
                              <option key={`${r!.name}-${m.name}`} value={`${r!.name}::${m.name}::${m.price}`}>
                                {r!.name}: {m.name} — {m.price}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    ) : null;
                  })()}
                  <button
                    onClick={async () => {
                      if (!order || !phone.trim() || editItems.length === 0) return;
                      setEditItemsSaving(true);
                      try {
                        const res = await fetch(`/api/orders/${order.id}/edit`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            phone: phone.trim(),
                            items: editItems.map((i) => ({
                              restaurantName: i.restaurantName,
                              restaurantSlug: i.restaurantSlug ?? getSlugByRestaurantName(i.restaurantName),
                              itemName: i.itemName,
                              price: i.price,
                              priceValue: i.priceValue,
                              quantity: i.quantity,
                            })),
                          }),
                        });
                        if (res.ok) {
                          setShowEditItems(false);
                          const data = await fetch(`/api/orders/${order.id}?phone=${encodeURIComponent(phone.trim())}`).then((r) => r.json());
                          setOrder(data);
                        } else {
                          const d = await res.json();
                          setError(d.error || "Failed to update");
                        }
                      } finally {
                        setEditItemsSaving(false);
                      }
                    }}
                    disabled={editItemsSaving}
                    className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                  >
                    {editItemsSaving ? "Saving..." : "Save items"}
                  </button>
                </div>
              )}
              {showEditNotes && canCancel && (
                <div className="mb-4">
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    placeholder="Special requests, allergies..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm mb-2"
                  />
                  <button
                    onClick={async () => {
                      if (!order || !phone.trim()) return;
                      setEditSaving(true);
                      try {
                        const res = await fetch(`/api/orders/${order.id}/edit`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ phone: phone.trim(), notes: editNotes.trim() }),
                        });
                        if (res.ok) setShowEditNotes(false);
                      } finally {
                        setEditSaving(false);
                      }
                    }}
                    disabled={editSaving}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                  >
                    {editSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}

              {/* Timeline */}
              <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-4">
                {STATUS_STEPS.map((step, i) => {
                  const isActive = i <= currentStepIndex;
                  const timestamp =
                    step === "pending"
                      ? order.createdAt
                      : step === "preparing"
                        ? order.confirmedAt || order.readyAt
                        : step === "out_for_delivery"
                          ? order.pickedAt
                          : step === "delivered"
                            ? order.deliveredAt
                            : null;
                  return (
                    <div key={step} className="relative -left-6 flex items-start gap-3">
                      <div
                        className={`mt-1.5 w-3 h-3 rounded-full shrink-0 ${
                          isActive ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      />
                      <div>
                        <p
                          className={`font-medium ${
                            isActive
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {STATUS_LABELS[step] || step}
                        </p>
                        {timestamp && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {formatTime(timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{order.landmark}</span>
              </div>
              {order.deliveryAddress && order.deliveryAddress !== order.landmark && (
                <p className="text-sm text-slate-600 dark:text-slate-400 pl-6">
                  {order.deliveryAddress}
                </p>
              )}
              {order.deliveryLat != null && order.deliveryLng != null && (order.driverLat != null && order.driverLng != null
                ? (
                    <DeliveryMap
                      driverLat={order.driverLat}
                      driverLng={order.driverLng}
                      deliveryLat={order.deliveryLat}
                      deliveryLng={order.deliveryLng}
                      landmark={order.landmark}
                      lastUpdatedAt={order.driverLocationUpdatedAt}
                      showNavigateButton={true}
                      className="mt-3"
                    />
                  )
                : ["pending", "confirmed", "preparing"].includes(order.status) && (order.restaurantLat != null && order.restaurantLng != null)
                  ? (
                      <DeliveryMap
                        driverLat={null}
                        driverLng={null}
                        deliveryLat={order.deliveryLat}
                        deliveryLng={order.deliveryLng}
                        landmark={order.landmark}
                        restaurantLat={order.restaurantLat}
                        restaurantLng={order.restaurantLng}
                        restaurantName={order.items?.[0]?.restaurant_name}
                        showNavigateButton={true}
                        className="mt-3"
                      />
                    )
                  : (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLat},${order.deliveryLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-orange-600 hover:underline font-medium mt-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in Google Maps
                      </a>
                    )
              )}
              <a
                href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 font-medium"
              >
                <Headphones className="w-4 h-4" />
                Contact customer support
              </a>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Order items</h3>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.item_name} × {item.quantity} — {item.price}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                Total: ₱{Number(order.totalPhp).toLocaleString()}
              </p>
            </div>

            {order.status === "delivered" && restaurantSlug && !reviewSubmitted && (
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Rate your experience
                </h3>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReviewRating(r)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          r <= reviewRating ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Optional comment..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm mb-2"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewRating < 1 || reviewLoading}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {reviewLoading ? "Sending..." : "Submit review"}
                </button>
              </div>
            )}
            {reviewSubmitted && (
              <p className="text-green-600 dark:text-green-400 text-sm">Thanks for your review!</p>
            )}

            {order.status !== "cancelled" && (
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Message about this order
                </h3>
                {messages.length > 0 && (
                  <ul className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                    {messages.map((m) => (
                      <li
                        key={m.id}
                        className={`text-sm p-2 rounded-lg ${
                          m.sender_type === "customer"
                            ? "bg-primary/10 text-slate-900 dark:text-white ml-4"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mr-4"
                        }`}
                      >
                        {m.message}
                        <span className="block text-xs text-slate-500 mt-0.5">
                          {new Date(m.created_at).toLocaleTimeString("en-PH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || chatLoading}
                    className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <main className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-slate-500">Loading...</div>
        </main>
      }
    >
      <TrackPageContent />
    </Suspense>
  );
}

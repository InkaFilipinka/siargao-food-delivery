"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, Package, MapPin, ExternalLink, Headphones } from "lucide-react";
import { SUPPORT_WHATSAPP } from "@/config/support";

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

const STATUS_STEPS = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "picked",
  "out_for_delivery",
  "delivered",
];

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
      } catch {
        /* ignore */
      }
    }
  }, [idFromUrl]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    items: { item_name: string; quantity: number; price: string; restaurant_name: string }[];
  } | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);
    if (!orderId.trim() || !phone.trim()) {
      setError("Enter order ID and phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/${orderId.trim()}?phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order not found");
      }

      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find order");
    } finally {
      setLoading(false);
    }
  }

  const currentStepIndex = order
    ? STATUS_STEPS.indexOf(order.status) >= 0
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

              {/* Timeline */}
              <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-4">
                {STATUS_STEPS.map((step, i) => {
                  const isActive = i <= currentStepIndex;
                  const timestamp =
                    step === "pending"
                      ? order.createdAt
                      : step === "confirmed"
                        ? order.confirmedAt
                        : step === "ready"
                          ? order.readyAt
                          : step === "picked"
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
              {order.deliveryLat != null && order.deliveryLng != null && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLat},${order.deliveryLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-orange-600 hover:underline font-medium mt-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Google Maps
                </a>
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

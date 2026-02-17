"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";

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

export default function StaffOrdersPage() {
  const [orderId, setOrderId] = useState("");
  const [newStatus, setNewStatus] = useState("confirmed");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim()) return;
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId.trim()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
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

  return (
    <main className="pt-16 md:pt-20 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Staff: Update order status
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Enter order ID and select new status. Use <Link href="/track" className="text-orange-600 hover:underline">Track</Link> to look up orders.
        </p>

        <form onSubmit={handleUpdate} className="space-y-4">
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
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
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
      </div>
    </main>
  );
}

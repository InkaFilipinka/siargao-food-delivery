"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, Loader2, RefreshCw, AlertCircle } from "lucide-react";

const STAFF_TOKEN_KEY = "siargao-staff-token";

type Order = {
  id: string;
  status: string;
  customerName: string;
  totalPhp: number;
  tipPhp?: number;
  createdAt: string;
  cashReceivedByDriver?: number | null;
  cashTurnedIn?: number | null;
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminCashPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem(STAFF_TOKEN_KEY) : null;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/orders", { headers: getAuthHeaders() })
      .then(async (res) => {
        if (res.status === 401) return { orders: [] };
        const data = await res.json();
        return data;
      })
      .then((data) => setOrders(data.orders || []))
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [getAuthHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  const cashOrders = orders.filter((o) => o.status === "delivered" || o.status === "out_for_delivery" || o.status === "picked");
  const withVariance = cashOrders.filter(
    (o) =>
      o.cashReceivedByDriver != null &&
      o.cashTurnedIn != null &&
      Math.abs((o.cashReceivedByDriver ?? 0) - (o.cashTurnedIn ?? 0)) > 0.01
  );
  const totalExpected = cashOrders.reduce((s, o) => s + o.totalPhp, 0);
  const totalReceived = cashOrders.reduce((s, o) => s + (o.cashReceivedByDriver ?? 0), 0);
  const totalTurnedIn = cashOrders.reduce((s, o) => s + (o.cashTurnedIn ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Cash ledger
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Cash expected, received by driver, turned in at hub
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Cash expected (delivered)</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ₱{totalExpected.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Cash received by driver</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ₱{totalReceived.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Cash turned in</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ₱{totalTurnedIn.toLocaleString()}
          </p>
        </div>
      </div>

      {withVariance.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">
            Orders with variance ({withVariance.length})
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-500">
            Received ≠ Turned in. Check Driver portal for variance reasons.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">Recent delivered orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">Order</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">Date</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">Expected</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">Received</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">Turned in</th>
              </tr>
            </thead>
            <tbody>
              {cashOrders.slice(0, 50).map((o) => (
                <tr key={o.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="px-4 py-2 font-mono text-xs text-slate-500">{String(o.id).slice(0, 8)}…</td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-2 text-right font-medium">₱{Number(o.totalPhp).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">
                    {o.cashReceivedByDriver != null
                      ? `₱${Number(o.cashReceivedByDriver).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {o.cashTurnedIn != null
                      ? `₱${Number(o.cashTurnedIn).toLocaleString()}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

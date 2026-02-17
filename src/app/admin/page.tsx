"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  DollarSign,
} from "lucide-react";

const STAFF_TOKEN_KEY = "siargao-staff-token";

type OrderSummary = {
  id: string;
  status: string;
  customerName: string;
  totalPhp: number;
  createdAt: string;
};

type CommissionIncome = {
  periodStart: string;
  periodLabel: string;
  byRestaurant: {
    restaurantName: string;
    slug: string;
    foodCommissionPhp: number;
    deliveryCommissionPhp: number;
    totalCommissionPhp: number;
  }[];
  totalFoodCommissionPhp: number;
  totalDeliveryCommissionPhp: number;
  totalCommissionPhp: number;
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [commission, setCommission] = useState<CommissionIncome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = (): HeadersInit => {
    const token = sessionStorage.getItem(STAFF_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const token = sessionStorage.getItem(STAFF_TOKEN_KEY);
    if (!token) return;
    const headers = getAuthHeaders();
    Promise.all([
      fetch("/api/orders", { headers }).then(async (res) => {
        if (res.status === 401) throw new Error("Unauthorized");
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      }),
      fetch("/api/admin/commission-income", { headers }).then(async (res) => {
        if (res.ok) return res.json();
        return null;
      }),
    ])
      .then(([orderData, commissionData]) => {
        setOrders(orderData.orders || []);
        setCommission(commissionData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    active: orders.filter((o) =>
      ["confirmed", "preparing", "ready", "assigned", "picked", "out_for_delivery"].includes(
        o.status
      )
    ).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const recent = orders.slice(0, 10);

  const formatTime = (s: string) => {
    return new Date(s).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className=" rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-6 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Make sure you&apos;re signed in at the Staff page first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Order overview and recent activity
        </p>
      </div>

      {commission && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Commission income — {commission.periodLabel}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Food commission</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ₱{commission.totalFoodCommissionPhp.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Delivery commission</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ₱{commission.totalDeliveryCommissionPhp.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total today</p>
              <p className="text-2xl font-bold text-green-600">
                ₱{commission.totalCommissionPhp.toLocaleString()}
              </p>
            </div>
          </div>
          {commission.byRestaurant.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 text-slate-500 dark:text-slate-400">Restaurant</th>
                    <th className="text-right py-2 text-slate-500 dark:text-slate-400">Food</th>
                    <th className="text-right py-2 text-slate-500 dark:text-slate-400">Delivery</th>
                    <th className="text-right py-2 text-slate-500 dark:text-slate-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {commission.byRestaurant.map((r) => (
                    <tr key={r.slug} className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="py-2 text-slate-900 dark:text-white">{r.restaurantName}</td>
                      <td className="py-2 text-right">₱{r.foodCommissionPhp.toLocaleString()}</td>
                      <td className="py-2 text-right">₱{r.deliveryCommissionPhp.toLocaleString()}</td>
                      <td className="py-2 text-right font-medium">₱{r.totalCommissionPhp.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No commission from orders today yet.</p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total orders
            </span>
            <Package className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pending
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stats.pending}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              In progress
            </span>
            <Package className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stats.active}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Delivered
            </span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stats.delivered}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Cancelled
            </span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stats.cancelled}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recent.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              No orders yet
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Order
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Total
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/orders?id=${o.id}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {String(o.id).slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-900 dark:text-white">
                      {o.customerName}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium">
                      ₱{Number(o.totalPhp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          o.status === "delivered"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : o.status === "cancelled"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {formatTime(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

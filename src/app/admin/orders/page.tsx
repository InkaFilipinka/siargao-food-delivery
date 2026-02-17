"use client";

import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Orders
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View and update order status
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 max-w-lg">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary/10">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Order management
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              The full order list, status updates, and filtering are available on the Staff page.
            </p>
            <Link
              href="/staff/orders"
              className="inline-flex items-center gap-2 mt-4 bg-primary text-primary-foreground font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Open Staff Orders
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

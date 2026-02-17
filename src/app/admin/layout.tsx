"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  Lock,
  ChevronLeft,
  Search,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAFF_TOKEN_KEY = "siargao-staff-token";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/support", label: "Support", icon: Search },
  { href: "/admin/cash", label: "Cash ledger", icon: DollarSign },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem(STAFF_TOKEN_KEY);
    if (token) {
      setAuthenticated(true);
      return;
    }
    fetch("/api/admin/status")
      .then((res) => res.json())
      .then((data) => {
        setAuthenticated(!data.authRequired);
      })
      .catch(() => setAuthenticated(false));
  }, [pathname]);

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 text-center">
            Admin access required
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 text-center">
            Sign in with your staff token at the Staff page first, then return here.
          </p>
          <Link
            href="/staff/orders"
            className="block w-full text-center bg-primary text-primary-foreground font-medium px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Staff login
          </Link>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Set <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">STAFF_TOKEN</code> in .env to enable auth.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            {sidebarOpen && (
              <Link href="/admin" className="font-semibold text-slate-900 dark:text-white">
                Admin
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600"
            >
              <ChevronLeft
                className={cn("w-5 h-5 transition-transform", !sidebarOpen && "rotate-180")}
              />
            </button>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="p-2 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            >
              <ShoppingBag className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>Back to site</span>}
            </Link>
          </div>
        </div>
      </aside>
      <main
        className={cn(
          "flex-1 transition-all",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}

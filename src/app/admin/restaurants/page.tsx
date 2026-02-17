"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Clock } from "lucide-react";

type Restaurant = {
  name: string;
  slug: string;
  categories: string[];
  priceRange: string | null;
  tags: string[];
  menuItems: { name: string; price: string }[];
  hours?: string | null;
  minOrderPhp?: number | null;
};

export default function AdminRestaurantsPage() {
  const [data, setData] = useState<{
    restaurants: Restaurant[];
    categories: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-6 text-center">
        <p className="text-red-600 dark:text-red-400">Failed to load restaurants</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Restaurants
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {data.restaurants.length} venues from static data
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.restaurants.map((r) => (
          <div
            key={r.slug}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {r.name}
                </h3>
                <Link
                  href={`/restaurant/${r.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-primary shrink-0"
                  title="View on site"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {r.categories.slice(0, 3).map((c) => (
                  <span
                    key={c}
                    className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-3 text-sm text-slate-500 dark:text-slate-400">
                {r.hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {r.hours.replace("-", " – ")}
                  </span>
                )}
                {r.minOrderPhp != null && r.minOrderPhp > 0 && (
                  <span>Min ₱{r.minOrderPhp}</span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {r.menuItems.length} menu items • {r.priceRange || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

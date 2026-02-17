"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Loader2 } from "lucide-react";

const STAFF_TOKEN_KEY = "siargao-staff-token";

type Review = {
  id: string;
  restaurantSlug: string;
  orderId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem(STAFF_TOKEN_KEY);
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch("/api/admin/reviews", { headers })
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Restaurant reviews</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-medium text-slate-900 dark:text-white">{r.restaurantSlug}</span>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    {r.rating}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              {r.comment && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{r.comment}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">Order: {String(r.orderId).slice(0, 8)}…</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-center text-slate-500 py-12">No reviews yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

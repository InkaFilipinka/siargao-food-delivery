"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2, Tag } from "lucide-react";

const STAFF_TOKEN_KEY = "siargao-staff-token";

type Promo = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderPhp: number;
  maxUses: number | null;
  usesCount: number;
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("fixed");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderPhp, setMinOrderPhp] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getHeaders = (): HeadersInit => {
    const token = sessionStorage.getItem(STAFF_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadPromos = () => {
    setLoading(true);
    const headers = getHeaders();
    fetch("/api/admin/promos", { headers })
      .then((r) => r.json())
      .then((d) => setPromos(d.promos || []))
      .catch(() => setPromos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPromos();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("Code is required");
      return;
    }
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setError("Discount value must be positive");
      return;
    }
    if (discountType === "percent" && val > 100) {
      setError("Percent cannot exceed 100");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getHeaders() } as HeadersInit,
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: val,
          minOrderPhp: parseFloat(minOrderPhp) || 0,
          maxUses: maxUses ? parseInt(maxUses, 10) : null,
          validUntil: validUntil || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setModalOpen(false);
      setCode("");
      setDiscountValue("");
      setMinOrderPhp("");
      setMaxUses("");
      setValidUntil("");
      loadPromos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Tag className="w-7 h-7 text-primary" />
          Promo codes
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add promo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left p-4 font-medium">Code</th>
                <th className="text-left p-4 font-medium">Discount</th>
                <th className="text-left p-4 font-medium">Min order</th>
                <th className="text-left p-4 font-medium">Uses</th>
                <th className="text-left p-4 font-medium">Valid until</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                  <td className="p-4 font-mono font-medium">{p.code}</td>
                  <td className="p-4">
                    {p.discountType === "percent"
                      ? `${p.discountValue}%`
                      : `₱${p.discountValue.toLocaleString()}`}
                  </td>
                  <td className="p-4">₱{(p.minOrderPhp ?? 0).toLocaleString()}</td>
                  <td className="p-4">
                    {p.usesCount}
                    {p.maxUses != null ? ` / ${p.maxUses}` : ""}
                  </td>
                  <td className="p-4 text-slate-500">
                    {p.validUntil
                      ? new Date(p.validUntil).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {promos.length === 0 && (
            <p className="p-8 text-center text-slate-500">No promo codes yet. Create one above.</p>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              New promo code
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="SAVE20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="fixed">Fixed (₱)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder={discountType === "percent" ? "20" : "50"}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min order (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={minOrderPhp}
                  onChange={(e) => setMinOrderPhp(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max uses</label>
                <input
                  type="number"
                  min="0"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valid until</label>
                <input
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

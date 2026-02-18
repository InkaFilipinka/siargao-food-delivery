"use client";

import { useState, useEffect, useCallback } from "react";
import { Truck, Settings2, X } from "lucide-react";

const STAFF_TOKEN_KEY = "siargao-staff-token";

type Driver = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  gcash_number?: string | null;
  payout_method?: string | null;
  crypto_wallet_address?: string | null;
};

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPayoutMethod, setEditPayoutMethod] = useState<"cash" | "gcash" | "crypto">("cash");
  const [editGcashNumber, setEditGcashNumber] = useState("");
  const [editCryptoWallet, setEditCryptoWallet] = useState("");
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem(STAFF_TOKEN_KEY) : null;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/drivers", { headers: getAuthHeaders() })
      .then(async (r) => {
        if (r.status === 401) return { drivers: [] };
        return r.json();
      })
      .then((data) => setDrivers(data.drivers || []))
      .catch(() => setDrivers([]))
      .finally(() => setLoading(false));
  }, [getAuthHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (d: Driver) => {
    const pm = (d?.payout_method as "cash" | "gcash" | "crypto") || "cash";
    setEditId(d.id);
    setEditEmail(d.email || "");
    setEditPassword("");
    setEditPayoutMethod(pm);
    setEditGcashNumber(d.gcash_number || "");
    setEditCryptoWallet(d.crypto_wallet_address || "");
  };

  const saveDriver = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/drivers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          id: editId,
          email: editEmail.trim(),
          payout_method: editPayoutMethod,
          gcash_number: editPayoutMethod === "gcash" ? editGcashNumber.trim() : "",
          crypto_wallet_address: editPayoutMethod === "crypto" ? editCryptoWallet.trim() : "",
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });
      if (res.ok) {
        const { driver } = await res.json();
        setDrivers((prev) => prev.map((d) => (d.id === editId ? { ...d, ...driver } : d)));
        setEditId(null);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Drivers
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {drivers.length} driver{drivers.length !== 1 ? "s" : ""} • Login & payout
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map((d) => (
          <div
            key={d.id}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {d.name}
                </h3>
                <button
                  onClick={() => openEdit(d)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary"
                  title="Set login"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{d.phone}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {d.email ? `Login: ${d.email}` : "No login set"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Payout: {(d.payout_method as string) || "cash"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Driver login: {drivers.find((d) => d.id === editId)?.name}
              </h3>
              <button
                onClick={() => setEditId(null)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="driver@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payout method
                </label>
                <select
                  value={editPayoutMethod}
                  onChange={(e) => setEditPayoutMethod(e.target.value as "cash" | "gcash" | "crypto")}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                >
                  <option value="cash">Cash</option>
                  <option value="gcash">GCash</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>
              {editPayoutMethod === "gcash" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    GCash number
                  </label>
                  <input
                    type="text"
                    value={editGcashNumber}
                    onChange={(e) => setEditGcashNumber(e.target.value)}
                    placeholder="09XX XXX XXXX"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  />
                </div>
              )}
              {editPayoutMethod === "crypto" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Crypto wallet address
                  </label>
                  <input
                    type="text"
                    value={editCryptoWallet}
                    onChange={(e) => setEditCryptoWallet(e.target.value)}
                    placeholder="USDC/BUSD address"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New password (leave blank to keep)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditId(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={saveDriver}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

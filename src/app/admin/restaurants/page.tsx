"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Clock, Settings2, Image, X, Plus, Trash2 } from "lucide-react";
import { ImageUploadZone } from "@/components/image-upload-zone";

const STAFF_TOKEN_KEY = "siargao-staff-token";

type Restaurant = {
  name: string;
  slug: string;
  menuUrl?: string;
  categories: string[];
  priceRange: string | null;
  tags: string[];
  menuItems: { name: string; price: string }[];
  hours?: string | null;
  minOrderPhp?: number | null;
  isAdminRestaurant?: boolean;
  isHidden?: boolean;
};

type Config = {
  slug: string;
  commission_pct: number;
  delivery_commission_pct: number;
  gcash_number?: string | null;
  email?: string | null;
  payout_method?: string | null;
  crypto_wallet_address?: string | null;
  lat?: number | null;
  lng?: number | null;
  display_name?: string | null;
  whatsapp_number?: string | null;
  menu_url?: string | null;
};

export default function AdminRestaurantsPage() {
  const [data, setData] = useState<{
    restaurants: Restaurant[];
    categories: string[];
  } | null>(null);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editCommission, setEditCommission] = useState(30);
  const [editDeliveryCommission, setEditDeliveryCommission] = useState(30);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPayoutMethod, setEditPayoutMethod] = useState<"cash" | "gcash" | "crypto">("cash");
  const [editGcashNumber, setEditGcashNumber] = useState("");
  const [editCryptoWallet, setEditCryptoWallet] = useState("");
  const [editLat, setEditLat] = useState<string>("");
  const [editLng, setEditLng] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [mediaSlug, setMediaSlug] = useState<string | null>(null);
  const [mediaLogoUrl, setMediaLogoUrl] = useState("");
  const [mediaImageUrls, setMediaImageUrls] = useState<string[]>([]);
  const [mediaNewImageUrl, setMediaNewImageUrl] = useState("");
  const [mediaExtras, setMediaExtras] = useState<{ id?: string; itemName: string; price: string }[]>([]);
  const [mediaNewItemName, setMediaNewItemName] = useState("");
  const [mediaNewItemPrice, setMediaNewItemPrice] = useState("");
  const [mediaDisplayName, setMediaDisplayName] = useState("");
  const [mediaWhatsapp, setMediaWhatsapp] = useState("");
  const [mediaMenuUrl, setMediaMenuUrl] = useState("");
  const [mediaSaving, setMediaSaving] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<{ slug: string; name: string; isAdmin: boolean } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSlug, setAddSlug] = useState("");
  const [addCategories, setAddCategories] = useState("");
  const [addPriceRange, setAddPriceRange] = useState("$$");
  const [addSaving, setAddSaving] = useState(false);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem(STAFF_TOKEN_KEY) : null;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const headers = getAuthHeaders();
    Promise.all([
      fetch("/api/restaurants?includeHidden=1", { headers }).then((r) => r.json()),
      fetch("/api/admin/restaurant-config", { headers }).then(async (r) => {
        if (r.status === 401) return { configs: [] };
        return r.json();
      }),
    ])
      .then(([restData, configData]) => {
        setData(restData);
        setConfigs(configData.configs || []);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [getAuthHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  const getConfig = (slug: string) => configs.find((c) => c.slug === slug);

  const openMediaEdit = useCallback(
    async (r: Restaurant) => {
      setMediaSlug(r.slug);
      setMediaLogoUrl("");
      setMediaImageUrls([]);
      setMediaNewImageUrl("");
      setMediaExtras([]);
      setMediaNewItemName("");
      setMediaNewItemPrice("");
      setMediaError(null);
      const cfg = getConfig(r.slug);
      setMediaDisplayName((cfg as { display_name?: string })?.display_name ?? r.name ?? "");
      setMediaWhatsapp((cfg as { whatsapp_number?: string })?.whatsapp_number ?? "");
      setMediaMenuUrl((cfg as { menu_url?: string })?.menu_url ?? r.menuUrl ?? `https://siargaodelivery.com/${r.slug}/`);
      try {
        const [mediaRes, extrasRes] = await Promise.all([
          fetch(`/api/admin/restaurant-media?slug=${encodeURIComponent(r.slug)}`, { headers: getAuthHeaders() }),
          fetch(`/api/admin/restaurant-menu-extras?slug=${encodeURIComponent(r.slug)}`, { headers: getAuthHeaders() }),
        ]);
        const mediaData = await mediaRes.json();
        const extrasData = await extrasRes.json();
        setMediaLogoUrl(mediaData.logoUrl || "");
        setMediaImageUrls(Array.isArray(mediaData.imageUrls) ? mediaData.imageUrls : []);
        setMediaExtras((extrasData.items || []).map((i: { id: string; item_name: string; price: string }) => ({ id: i.id, itemName: i.item_name, price: i.price })));
      } catch {
        setMediaSlug(r.slug);
      }
    },
    [getAuthHeaders, getConfig]
  );

  const saveMedia = async () => {
    if (!mediaSlug) return;
    setMediaSaving(true);
    setMediaError(null);
    try {
      // Add pending menu item first if user filled it but didn't click the Plus
      if (mediaNewItemName.trim()) {
        const res = await fetch("/api/admin/restaurant-menu-extras", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({
            slug: mediaSlug,
            itemName: mediaNewItemName.trim(),
            price: mediaNewItemPrice.trim() || "0 PHP",
          }),
        });
        const data = await res.json();
        if (res.ok && data) {
          setMediaExtras((prev) => [...prev, { id: data.id, itemName: data.item_name, price: data.price }]);
          setMediaNewItemName("");
          setMediaNewItemPrice("");
        } else {
          throw new Error(data.error || "Failed to add menu item");
        }
      }
      // Add pending photo URL if user filled it but didn't click Add
      const imageUrlsToSave = mediaNewImageUrl.trim()
        ? [...mediaImageUrls.filter(Boolean), mediaNewImageUrl.trim()]
        : mediaImageUrls.filter(Boolean);

      const [mediaRes, configRes] = await Promise.all([
        fetch("/api/admin/restaurant-media", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({
            slug: mediaSlug,
            logoUrl: mediaLogoUrl.trim() || null,
            imageUrls: imageUrlsToSave,
          }),
        }),
        fetch("/api/admin/restaurant-config", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({
            slug: mediaSlug,
            display_name: mediaDisplayName.trim() || null,
            whatsapp_number: mediaWhatsapp.trim() || null,
            menu_url: mediaMenuUrl.trim() || null,
          }),
        }),
      ]);
      const mediaData = await mediaRes.json();
      const configData = await configRes.json();
      if (!mediaRes.ok) throw new Error(mediaData.details || mediaData.error || "Failed to save media");
      if (!configRes.ok) throw new Error(configData.details || configData.error || "Failed to save config");
      setMediaNewImageUrl("");
      setMediaSlug(null);
      load();
    } catch (e) {
      setMediaError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setMediaSaving(false);
    }
  };

  const addMenuExtra = async () => {
    if (!mediaSlug || !mediaNewItemName.trim()) return;
    try {
      const res = await fetch("/api/admin/restaurant-menu-extras", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          slug: mediaSlug,
          itemName: mediaNewItemName.trim(),
          price: mediaNewItemPrice.trim() || "0 PHP",
        }),
      });
      const data = await res.json();
      if (res.ok && data) {
        setMediaExtras((prev) => [...prev, { id: data.id, itemName: data.item_name, price: data.price }]);
        setMediaNewItemName("");
        setMediaNewItemPrice("");
        setMediaError(null);
        load();
      } else {
        setMediaError(data.error || "Failed to add menu item");
      }
    } catch (e) {
      setMediaError(e instanceof Error ? e.message : "Failed to add");
      /* ignore */
    }
  };

  const deleteMenuExtra = async (id: string) => {
    try {
      await fetch(`/api/admin/restaurant-menu-extras?id=${id}`, { method: "DELETE", headers: getAuthHeaders() });
      setMediaExtras((prev) => prev.filter((e) => e.id !== id));
      load();
    } catch {
      /* ignore */
    }
  };

  const performDelete = async () => {
    if (!deleteSlug) return;
    setDeleting(true);
    try {
      if (deleteSlug.isAdmin) {
        const res = await fetch(`/api/admin/restaurants?slug=${encodeURIComponent(deleteSlug.slug)}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed");
      } else {
        const res = await fetch("/api/admin/restaurants", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ action: "hide", slug: deleteSlug.slug }),
        });
        if (!res.ok) throw new Error("Failed");
      }
      setDeleteSlug(null);
      load();
    } catch {
      setDeleteSlug(null);
    } finally {
      setDeleting(false);
    }
  };

  const performUnhide = async (slug: string) => {
    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ action: "unhide", slug }),
      });
      if (res.ok) load();
    } catch {
      /* ignore */
    }
  };

  const saveAdd = async () => {
    const name = addName.trim();
    const slug = addSlug.trim().toLowerCase().replace(/\s+/g, "-") || name.toLowerCase().replace(/\s+/g, "-");
    if (!name) return;
    setAddSaving(true);
    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          action: "add",
          name,
          slug,
          categories: addCategories.split(",").map((c) => c.trim()).filter(Boolean),
          priceRange: addPriceRange,
          tags: [],
        }),
      });
      if (res.ok) {
        setAddOpen(false);
        setAddName("");
        setAddSlug("");
        setAddCategories("");
        setAddPriceRange("$$");
        load();
      }
    } finally {
      setAddSaving(false);
    }
  };

  const openEdit = (r: Restaurant) => {
    const c = getConfig(r.slug);
    const pm = (c?.payout_method as "cash" | "gcash" | "crypto") || "cash";
    setEditSlug(r.slug);
    setEditCommission(c?.commission_pct ?? 30);
    setEditDeliveryCommission(c?.delivery_commission_pct ?? 30);
    setEditEmail(c?.email ?? "");
    setEditPassword("");
    setEditPayoutMethod(pm);
    setEditGcashNumber(c?.gcash_number ?? "");
    setEditCryptoWallet(c?.crypto_wallet_address ?? "");
    setEditLat(c?.lat != null ? String(c.lat) : "");
    setEditLng(c?.lng != null ? String(c.lng) : "");
  };
  const saveConfig = async () => {
    if (!editSlug) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/restaurant-config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          slug: editSlug,
          commission_pct: editCommission,
          delivery_commission_pct: editDeliveryCommission,
          email: editEmail.trim(),
          payout_method: editPayoutMethod,
          gcash_number: editPayoutMethod === "gcash" ? editGcashNumber.trim() : "",
          crypto_wallet_address: editPayoutMethod === "crypto" ? editCryptoWallet.trim() : "",
          lat: editLat.trim() ? parseFloat(editLat) : null,
          lng: editLng.trim() ? parseFloat(editLng) : null,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });
      if (res.ok) {
        const { config } = await res.json();
        setConfigs((prev) => {
          const rest = prev.filter((c) => c.slug !== editSlug);
          return [...rest, config].sort((a, b) => a.slug.localeCompare(b.slug));
        });
        setEditSlug(null);
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

  if (!data) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-6 text-center">
        <p className="text-red-600 dark:text-red-400">Failed to load restaurants</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Restaurants
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {data.restaurants.length} venues • Commission % per venue
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.restaurants.map((r) => {
          const c = getConfig(r.slug);
          const commissionPct = c?.commission_pct ?? 30;
          const deliveryPct = c?.delivery_commission_pct ?? 30;
          const payoutMethod = (c?.payout_method as string) || "cash";
          return (
            <div
              key={r.slug}
              className={`rounded-xl border overflow-hidden ${r.isHidden ? "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {r.name}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(r)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary"
                      title="Commission settings"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openMediaEdit(r)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary"
                      title="Logo, images & menu"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/restaurant/${r.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary"
                      title="View on site"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    {r.isHidden ? (
                      <button
                        onClick={() => performUnhide(r.slug)}
                        className="p-1.5 rounded-lg text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                        title="Unhide"
                      >
                        Unhide
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteSlug({ slug: r.slug, name: r.name, isAdmin: !!r.isAdminRestaurant })}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {r.categories.slice(0, 3).map((cat) => (
                    <span
                      key={cat}
                      className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    >
                      {cat}
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
                  {r.menuItems.length} items • {r.priceRange || "—"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Food: {commissionPct}% • Delivery: {deliveryPct}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Payout: {payoutMethod}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {editSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Commission: {data.restaurants.find((r) => r.slug === editSlug)?.name}
              </h3>
              <button
                onClick={() => setEditSlug(null)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="admin-edit-commission" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Food commission %
                </label>
                <input
                  id="admin-edit-commission"
                  name="commission_pct"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={editCommission}
                  onChange={(e) => setEditCommission(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label htmlFor="admin-edit-delivery-commission" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Delivery commission %
                </label>
                <input
                  id="admin-edit-delivery-commission"
                  name="delivery_commission_pct"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={editDeliveryCommission}
                  onChange={(e) => setEditDeliveryCommission(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label htmlFor="admin-edit-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Login email
                </label>
                <input
                  id="admin-edit-email"
                  name="email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="restaurant@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label htmlFor="admin-edit-payout" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payout method
                </label>
                <select
                  id="admin-edit-payout"
                  name="payout_method"
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editLat}
                    onChange={(e) => setEditLat(e.target.value)}
                    placeholder="9.7854"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editLng}
                    onChange={(e) => setEditLng(e.target.value)}
                    placeholder="126.1574"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                Used to show distance from user to restaurant. Leave blank to use hub for delivery fee.
              </p>
              <div>
                <label htmlFor="admin-edit-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New password (leave blank to keep)
                </label>
                <input
                  id="admin-edit-password"
                  name="password"
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
                onClick={() => setEditSlug(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={saveConfig}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mediaSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Logo, images & menu — {data.restaurants.find((r) => r.slug === mediaSlug)?.name}
              </h3>
              <button onClick={() => { setMediaSlug(null); setMediaError(null); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="admin-media-display-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Restaurant name</label>
                <input
                  id="admin-media-display-name"
                  name="display_name"
                  type="text"
                  value={mediaDisplayName}
                  onChange={(e) => setMediaDisplayName(e.target.value)}
                  placeholder="Display name on site"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="admin-media-whatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp number <span className="text-slate-500 font-normal">(optional)</span></label>
                <input
                  id="admin-media-whatsapp"
                  name="whatsapp_number"
                  type="tel"
                  value={mediaWhatsapp}
                  onChange={(e) => setMediaWhatsapp(e.target.value)}
                  placeholder="+63 912 345 6789"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="admin-media-menu-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Menu / Order URL</label>
                <input
                  id="admin-media-menu-url"
                  name="menu_url"
                  type="url"
                  value={mediaMenuUrl}
                  onChange={(e) => setMediaMenuUrl(e.target.value)}
                  placeholder="https://siargaodelivery.com/sunset-pizza/ or external link"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo</label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Upload (drag & drop) or paste URL below. Saved as {mediaSlug}-logo.</p>
                <ImageUploadZone
                  slug={mediaSlug}
                  type="logo"
                  onUploaded={(url) => setMediaLogoUrl(url)}
                  getAuthHeaders={getAuthHeaders}
                  disabled={mediaSaving}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-2">Or paste URL:</p>
                <input
                  id="admin-media-logo-url"
                  name="logo_url"
                  type="url"
                  value={mediaLogoUrl}
                  onChange={(e) => setMediaLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Food images</label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Upload (drag & drop) or paste URL below.</p>
                <ImageUploadZone
                  slug={mediaSlug}
                  onUploaded={(url) => setMediaImageUrls((u) => [...u, url])}
                  getAuthHeaders={getAuthHeaders}
                  disabled={mediaSaving}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-2">Or add by URL:</p>
                <div className="space-y-2">
                  {mediaImageUrls.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setMediaImageUrls((u) => u.map((x, j) => (j === i ? e.target.value : x)))}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaImageUrls((u) => u.filter((_, j) => j !== i))}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={mediaNewImageUrl}
                      onChange={(e) => setMediaNewImageUrl(e.target.value)}
                      placeholder="Add image URL..."
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (mediaNewImageUrl.trim()) {
                          setMediaImageUrls((u) => [...u, mediaNewImageUrl.trim()]);
                          setMediaNewImageUrl("");
                        }
                      }}
                      title="Add image URL"
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Add menu item</label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Enter item name and price, then click Add or Save.</p>
                {mediaExtras.length > 0 && (
                  <ul className="mb-3 space-y-1">
                    {mediaExtras.map((e) => (
                      <li key={e.id || e.itemName} className="flex items-center justify-between gap-2 text-sm py-1">
                        <span>{e.itemName} — {e.price}</span>
                        {e.id && (
                          <button
                            type="button"
                            onClick={() => deleteMenuExtra(e.id!)}
                            className="text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mediaNewItemName}
                    onChange={(e) => setMediaNewItemName(e.target.value)}
                    placeholder="Item name"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                  />
                  <input
                    type="text"
                    value={mediaNewItemPrice}
                    onChange={(e) => setMediaNewItemPrice(e.target.value)}
                    placeholder="150 PHP"
                    className="w-24 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addMenuExtra}
                    title="Add item to menu"
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
            {mediaError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">{mediaError}</p>
            )}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => { setMediaSlug(null); setMediaError(null); }}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={saveMedia}
                disabled={mediaSaving}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {mediaSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Are you sure?</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              {deleteSlug.isAdmin
                ? `Permanently remove "${deleteSlug.name}"? This cannot be undone.`
                : `Hide "${deleteSlug.name}" from the site?`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteSlug(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={performDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Add restaurant</h3>
              <button
                onClick={() => setAddOpen(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="admin-add-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  id="admin-add-name"
                  name="name"
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Restaurant name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label htmlFor="admin-add-slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (URL)</label>
                <input
                  id="admin-add-slug"
                  name="slug"
                  type="text"
                  value={addSlug}
                  onChange={(e) => setAddSlug(e.target.value)}
                  placeholder="auto-generated from name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label htmlFor="admin-add-categories" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categories (comma-separated)</label>
                <input
                  id="admin-add-categories"
                  name="categories"
                  type="text"
                  value={addCategories}
                  onChange={(e) => setAddCategories(e.target.value)}
                  placeholder="Filipino, Seafood"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label htmlFor="admin-add-price-range" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price range</label>
                <select
                  id="admin-add-price-range"
                  name="price_range"
                  value={addPriceRange}
                  onChange={(e) => setAddPriceRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                >
                  <option value="$">$</option>
                  <option value="$$">$$</option>
                  <option value="$$$">$$$</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setAddOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={saveAdd}
                disabled={addSaving || !addName.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {addSaving ? "Adding…" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

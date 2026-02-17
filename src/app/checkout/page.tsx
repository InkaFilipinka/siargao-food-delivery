"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useDeliveryStore } from "@/store/delivery-store";
import { MapPicker } from "@/components/map-picker";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";

const TIP_OPTIONS = [0, 20, 50, 100];
const PRIORITY_FEE_PHP = 50;

function formatOrderForWhatsApp(
  orderId: string,
  items: { restaurantName: string; itemName: string; price: string; quantity: number }[],
  totalPhp: number,
  address: string,
  landmark: string,
  notes: string,
  timeWindow: "asap" | "scheduled",
  scheduledAt?: string
) {
  const lines = items.map((i) => `• ${i.itemName} x${i.quantity} - ${i.price}`);
  let text = `Hi! I'd like to place an order.\n\nOrder ID: ${orderId}\n\n${lines.join("\n")}\n\nTotal: ₱${totalPhp.toLocaleString()}\n\nDelivery: ${address.trim()}\nLandmark: ${landmark.trim()}`;
  if (notes.trim()) text += `\nNotes: ${notes.trim()}`;
  if (timeWindow === "scheduled" && scheduledAt) text += `\nDeliver at: ${scheduledAt}`;
  else text += `\nASAP`;
  return text;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { location: deliveryLocation, setLocation } = useDeliveryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [notes, setNotes] = useState("");
  const [timeWindow, setTimeWindow] = useState<"asap" | "scheduled">("asap");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [tipPhp, setTipPhp] = useState(0);
  const [priorityDelivery, setPriorityDelivery] = useState(false);
  const [allowSubstitutions, setAllowSubstitutions] = useState(true);

  const subtotalPhp = items.reduce((sum, i) => sum + i.priceValue * i.quantity, 0);
  const deliveryFeePhp = deliveryLocation?.feePhp ?? 0;
  const priorityFeePhp = priorityDelivery ? PRIORITY_FEE_PHP : 0;
  const totalPhp = subtotalPhp + deliveryFeePhp + tipPhp + priorityFeePhp;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!landmark.trim()) {
      setError("Landmark is required (e.g. near Bravo, beside...)");
      setLoading(false);
      return;
    }

    if (!deliveryLocation) {
      setError("Please set your delivery location on the map.");
      setLoading(false);
      return;
    }

    if (timeWindow === "scheduled" && (!scheduledDate || !scheduledTime)) {
      setError("Please select date and time for scheduled delivery.");
      setLoading(false);
      return;
    }

    const scheduledAt =
      timeWindow === "scheduled" && scheduledDate && scheduledTime
        ? `${scheduledDate}T${scheduledTime}:00`
        : undefined;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          deliveryAddress: address.trim() || deliveryLocation.placeName || `${deliveryLocation.lat}, ${deliveryLocation.lng}`,
          landmark: landmark.trim(),
          deliveryLat: deliveryLocation.lat,
          deliveryLng: deliveryLocation.lng,
          deliveryZoneId: deliveryLocation.zoneId,
          deliveryZoneName: deliveryLocation.zoneName,
          deliveryFeePhp: deliveryLocation.feePhp,
          deliveryDistanceKm: deliveryLocation.distance,
          notes: notes.trim() || undefined,
          items: items.map((i) => ({
            restaurantName: i.restaurantName,
            itemName: i.itemName,
            price: i.price,
            priceValue: i.priceValue,
            quantity: i.quantity,
          })),
          timeWindow,
          scheduledAt,
          tipPhp,
          priorityDelivery,
          allowSubstitutions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      clearCart();

      const displayScheduled = scheduledAt ? new Date(scheduledAt).toLocaleString() : undefined;
      const whatsappMessage = formatOrderForWhatsApp(
        data.id,
        items,
        totalPhp,
        address.trim() || deliveryLocation.placeName || "See landmark",
        landmark.trim(),
        notes.trim(),
        timeWindow,
        displayScheduled
      );

      if (typeof window !== "undefined") {
        sessionStorage.setItem("order-confirmation-wa", whatsappMessage);
      }

      router.push(`/order-confirmation?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="pt-16 md:pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your cart is empty</h1>
          <Link href="/#restaurants" className="text-orange-600 hover:text-orange-500 font-medium">
            Browse restaurants
          </Link>
        </div>
      </main>
    );
  }

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <main className="pt-16 md:pt-20 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Juan Dela Cruz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone number *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="09XX XXX XXXX"
            />
          </div>

          {/* Delivery location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Delivery location *
            </label>
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-left hover:border-orange-400 transition-colors"
            >
              <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
              {deliveryLocation ? (
                <span className="text-slate-900 dark:text-white">
                  {deliveryLocation.placeName || `${deliveryLocation.distance}km from hub`} • ₱{deliveryLocation.feePhp} delivery
                </span>
              ) : (
                <span className="text-slate-500">Click to set location on map</span>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Landmark * <span className="font-normal text-slate-500">e.g. &quot;near Bravo&quot;, &quot;beside Coconut Grove&quot;</span>
            </label>
            <input
              type="text"
              required
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Near Bravo, beside..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Full address <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Resort name, street, barangay"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">When to deliver *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeWindow"
                  checked={timeWindow === "asap"}
                  onChange={() => setTimeWindow("asap")}
                  className="text-orange-500"
                />
                <span className="text-slate-900 dark:text-white">ASAP</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeWindow"
                  checked={timeWindow === "scheduled"}
                  onChange={() => setTimeWindow("scheduled")}
                  className="text-orange-500"
                />
                <span className="text-slate-900 dark:text-white">Schedule</span>
              </label>
            </div>
            {timeWindow === "scheduled" && (
              <div className="flex gap-3 mt-3">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={minDate}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tip for rider <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <div className="flex gap-2">
              {TIP_OPTIONS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTipPhp(amt)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tipPhp === amt
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {amt === 0 ? "None" : `₱${amt}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={priorityDelivery}
                onChange={(e) => setPriorityDelivery(e.target.checked)}
                className="rounded text-orange-500"
              />
              <span className="text-slate-900 dark:text-white">Priority delivery (+₱{PRIORITY_FEE_PHP})</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowSubstitutions}
                onChange={(e) => setAllowSubstitutions(e.target.checked)}
                className="rounded text-orange-500"
              />
              <span className="text-slate-900 dark:text-white">Allow substitutions if item unavailable</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Order notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Special requests, allergies..."
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
            <h2 className="font-semibold text-slate-900 dark:text-white">Order summary</h2>
            {items.map((item) => (
              <div key={`${item.restaurantSlug}-${item.itemName}`} className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>{item.itemName} × {item.quantity}</span>
                <span>₱{(item.priceValue * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-2 space-y-1 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₱{subtotalPhp.toLocaleString()}</span>
              </div>
              {deliveryFeePhp > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>₱{deliveryFeePhp}</span>
                </div>
              )}
              {tipPhp > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tip</span>
                  <span>₱{tipPhp}</span>
                </div>
              )}
              {priorityFeePhp > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Priority</span>
                  <span>₱{priorityFeePhp}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2">
              <span>Total</span>
              <span className="text-amber-600 dark:text-amber-400">₱{totalPhp.toLocaleString()}</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Placing order...
              </>
            ) : (
              "Place order"
            )}
          </button>
        </form>

        <MapPicker
          isOpen={mapOpen}
          onClose={() => setMapOpen(false)}
          onLocationSelect={(loc) => {
            setLocation(loc);
            setMapOpen(false);
          }}
        />
      </div>
    </main>
  );
}

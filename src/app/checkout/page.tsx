"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useDeliveryStore } from "@/store/delivery-store";
import { useLastOrderStore } from "@/store/last-order-store";
import { MapPicker } from "@/components/map-picker";
import { CryptoPaymentModal } from "@/components/crypto-payment-modal";
import { ArrowLeft, CreditCard, Loader2, MapPin, Banknote, Smartphone, Wallet } from "lucide-react";
import type { PaymentMethod } from "@/types/order";

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
  const setLastOrder = useLastOrderStore((s) => s.setLastOrder);
  const { location: deliveryLocation, setLocation } = useDeliveryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [notes, setNotes] = useState("");
  const [timeWindow, setTimeWindow] = useState<"asap" | "scheduled">("asap");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [tipPhp, setTipPhp] = useState(0);
  const [priorityDelivery, setPriorityDelivery] = useState(false);
  const [allowSubstitutions, setAllowSubstitutions] = useState(true);
  const [minOrderMap, setMinOrderMap] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data: { restaurants: { slug: string; minOrderPhp?: number | null }[] }) => {
        const map: Record<string, number> = {};
        for (const r of data.restaurants || []) {
          if (r.minOrderPhp != null && r.minOrderPhp > 0) map[r.slug] = r.minOrderPhp;
        }
        setMinOrderMap(map);
      })
      .catch(() => {});
  }, []);

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

    if (paymentMethod === "cash") {
      if (deliveryLocation.lat == null || deliveryLocation.lng == null) {
        setError("For cash on delivery, please use the map to set your exact location (geolocation required).");
        setLoading(false);
        return;
      }
    }

    if (timeWindow === "scheduled" && (!scheduledDate || !scheduledTime)) {
      setError("Please select date and time for scheduled delivery.");
      setLoading(false);
      return;
    }

    // Minimum order per restaurant
    const byRestaurant = new Map<string, { subtotal: number; name: string }>();
    for (const item of items) {
      const key = item.restaurantSlug || item.restaurantName;
      const existing = byRestaurant.get(key);
      const add = item.priceValue * item.quantity;
      if (existing) {
        existing.subtotal += add;
      } else {
        byRestaurant.set(key, { subtotal: add, name: item.restaurantName });
      }
    }
    for (const [slug, { subtotal, name }] of byRestaurant) {
      const min = minOrderMap[slug];
      if (min != null && subtotal < min) {
        setError(`${name} has a minimum order of ₱${min.toLocaleString()}. Your items: ₱${subtotal.toLocaleString()}`);
        setLoading(false);
        return;
      }
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
            restaurantSlug: i.restaurantSlug,
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
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      const orderId = data.id;
      const displayScheduled = scheduledAt ? new Date(scheduledAt).toLocaleString() : undefined;
      const whatsappMessage = formatOrderForWhatsApp(
        orderId,
        items,
        totalPhp,
        address.trim() || deliveryLocation.placeName || "See landmark",
        landmark.trim(),
        notes.trim(),
        timeWindow,
        displayScheduled
      );

      const saveSessionAndRedirect = (id: string) => {
        setLastOrder(items);
        clearCart();
        if (typeof window !== "undefined") {
          sessionStorage.setItem("order-confirmation-wa", whatsappMessage);
          sessionStorage.setItem(
            "order-confirmation-eta",
            JSON.stringify({ distanceKm: deliveryLocation.distance, priority: priorityDelivery })
          );
          sessionStorage.setItem(
            "order-confirmation-meta",
            JSON.stringify({
              orderId: id,
              phone: phone.trim(),
              email: email.trim() || undefined,
              receiptData: email.trim()
                ? {
                    customerName: name.trim(),
                    orderId: id,
                    items: items.map((i) => `${i.itemName} x${i.quantity} - ${i.price}`).join("\n"),
                    subtotal: subtotalPhp.toLocaleString(),
                    deliveryFee: deliveryFeePhp.toLocaleString(),
                    tip: tipPhp.toLocaleString(),
                    priorityFee: priorityFeePhp.toLocaleString(),
                    total: totalPhp.toLocaleString(),
                    landmark: landmark.trim(),
                    address: address.trim() || deliveryLocation.placeName || "See landmark",
                    timeWindow: timeWindow === "scheduled" && scheduledAt ? scheduledAt : "ASAP",
                  }
                : undefined,
            })
          );
        }
        router.push(`/order-confirmation?id=${id}`);
      };

      const saveSessionForRedirect = () => {
        setLastOrder(items);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "order-confirmation-wa",
            formatOrderForWhatsApp(
              orderId,
              items,
              totalPhp,
              address.trim() || deliveryLocation.placeName || "See landmark",
              landmark.trim(),
              notes.trim(),
              timeWindow,
              displayScheduled
            )
          );
          sessionStorage.setItem(
            "order-confirmation-eta",
            JSON.stringify({ distanceKm: deliveryLocation.distance, priority: priorityDelivery })
          );
          sessionStorage.setItem(
            "order-confirmation-meta",
            JSON.stringify({
              orderId,
              phone: phone.trim(),
              email: email.trim() || undefined,
              receiptData: email.trim()
                ? {
                    customerName: name.trim(),
                    orderId,
                    items: items.map((i) => `${i.itemName} x${i.quantity} - ${i.price}`).join("\n"),
                    subtotal: subtotalPhp.toLocaleString(),
                    deliveryFee: deliveryFeePhp.toLocaleString(),
                    tip: tipPhp.toLocaleString(),
                    priorityFee: priorityFeePhp.toLocaleString(),
                    total: totalPhp.toLocaleString(),
                    landmark: landmark.trim(),
                    address: address.trim() || deliveryLocation.placeName || "See landmark",
                    timeWindow: timeWindow === "scheduled" && scheduledAt ? scheduledAt : "ASAP",
                  }
                : undefined,
            })
          );
        }
      };

      if (paymentMethod === "card") {
        const stripeRes = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPhp,
            orderId,
            customerEmail: email.trim() || undefined,
            customerName: name.trim(),
            lineItems: items.map((i) => ({
              name: i.itemName,
              amount: i.priceValue * i.quantity,
              quantity: i.quantity,
            })),
          }),
        });
        const stripeData = await stripeRes.json();
        if (!stripeRes.ok || !stripeData.url) throw new Error(stripeData.error || "Stripe failed");
        saveSessionForRedirect();
        clearCart();
        window.location.href = stripeData.url;
        return;
      }

      if (paymentMethod === "gcash") {
        const pmRes = await fetch("/api/create-paymongo-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPhp,
            orderId,
            customerEmail: email.trim() || undefined,
            customerName: name.trim(),
          }),
        });
        const pmData = await pmRes.json();
        if (!pmRes.ok || !pmData.checkoutUrl) throw new Error(pmData.error || "GCash payment failed");
        saveSessionForRedirect();
        clearCart();
        window.location.href = pmData.checkoutUrl;
        return;
      }

      if (paymentMethod === "paypal") {
        const ppRes = await fetch("/api/create-paypal-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalPhp, orderId }),
        });
        const ppData = await ppRes.json();
        if (!ppRes.ok || !ppData.approvalUrl) throw new Error(ppData.error || "PayPal failed");
        saveSessionForRedirect();
        clearCart();
        window.location.href = ppData.approvalUrl;
        return;
      }

      if (paymentMethod === "crypto") {
        setPendingOrderId(orderId);
        setCryptoModalOpen(true);
        setLoading(false);
        return;
      }

      saveSessionAndRedirect(orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Your cart is empty</h1>
          <Link href="/#restaurants" className="text-primary hover:underline font-medium">
            Browse restaurants
          </Link>
        </div>
      </main>
    );
  }

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="09XX XXX XXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email <span className="font-normal text-slate-500">(optional, for receipt)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="you@example.com"
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
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-left hover:border-primary/50 transition-colors"
            >
              <MapPin className="w-5 h-5 text-primary shrink-0" />
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
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
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
                  className="text-primary"
                />
                <span className="text-slate-900 dark:text-white">ASAP</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeWindow"
                  checked={timeWindow === "scheduled"}
                  onChange={() => setTimeWindow("scheduled")}
                  className="text-primary"
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Payment method *</label>
            <div className="space-y-2">
              {[
                { id: "cash" as const, label: "Cash on delivery", icon: Banknote },
                { id: "card" as const, label: "Credit/Debit card (Stripe)", icon: CreditCard },
                { id: "gcash" as const, label: "GCash (PayMongo)", icon: Smartphone },
                { id: "crypto" as const, label: "Crypto (USDC/BUSD)", icon: Wallet },
                { id: "paypal" as const, label: "PayPal", icon: CreditCard },
              ].map(({ id, label, icon: Icon }) => (
                <label
                  key={id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentMethod === id
                      ? "border-primary bg-primary/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === id}
                    onChange={() => setPaymentMethod(id)}
                    className="text-primary"
                  />
                  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />
                  <span className="text-slate-900 dark:text-white">{label}</span>
                </label>
              ))}
            </div>
            {paymentMethod === "cash" && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                <strong>Geolocation required.</strong> Order is confirmed by the restaurant or us via a call to you before preparation.
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
                      ? "bg-primary text-primary-foreground"
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
                className="rounded text-primary"
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
                className="rounded text-primary"
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
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Special requests, allergies..."
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
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
            <div className="flex justify-between font-semibold text-slate-900 dark:text-white pt-2">
              <span>Total</span>
              <span className="text-primary">₱{totalPhp.toLocaleString()}</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-70 transition-opacity flex items-center justify-center gap-2"
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

        <CryptoPaymentModal
          isOpen={cryptoModalOpen}
          onClose={() => {
            setCryptoModalOpen(false);
            setPendingOrderId(null);
          }}
          amountPhp={totalPhp}
          orderId={pendingOrderId || ""}
          customerEmail={email}
          customerName={name}
          onSuccess={async (txHash) => {
            if (pendingOrderId && txHash) {
              await fetch(`/api/orders/${pendingOrderId}/confirm-crypto`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ txHash }),
              });
            }
            const displayScheduled = timeWindow === "scheduled" && scheduledDate && scheduledTime
              ? `${scheduledDate}T${scheduledTime}:00`
              : undefined;
            const wa = formatOrderForWhatsApp(
              pendingOrderId!,
              items,
              totalPhp,
              address.trim() || deliveryLocation?.placeName || "See landmark",
              landmark.trim(),
              notes.trim(),
              timeWindow,
              displayScheduled ? new Date(displayScheduled).toLocaleString() : undefined
            );
            setLastOrder(items);
            clearCart();
            if (typeof window !== "undefined") {
              sessionStorage.setItem("order-confirmation-wa", wa);
              sessionStorage.setItem(
                "order-confirmation-eta",
                JSON.stringify({ distanceKm: deliveryLocation?.distance, priority: priorityDelivery })
              );
              sessionStorage.setItem(
                "order-confirmation-meta",
                JSON.stringify({
                  orderId: pendingOrderId,
                  phone: phone.trim(),
                  email: email.trim() || undefined,
                })
              );
            }
            setCryptoModalOpen(false);
            setPendingOrderId(null);
            router.push(`/order-confirmation?id=${pendingOrderId}`);
          }}
          onError={(err) => setError(err)}
        />
      </div>
    </main>
  );
}

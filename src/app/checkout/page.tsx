"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useDeliveryStore } from "@/store/delivery-store";
import { useLastOrderStore } from "@/store/last-order-store";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { MapPicker } from "@/components/map-picker";
import { CryptoPaymentModal } from "@/components/crypto-payment-modal";
import { ArrowLeft, CreditCard, Loader2, MapPin, Banknote, Smartphone, Wallet } from "lucide-react";
import type { PaymentMethod } from "@/types/order";
import { getIsGroceryBySlug } from "@/data/combined";
import { getDistanceAndFee } from "@/config/delivery-zones";

const TIP_OPTIONS = [0, 20, 50, 100];
const PRIORITY_FEE_PHP = 50;

function buildDeliveryAddress(
  base: string,
  room?: string,
  floor?: string,
  guestName?: string
): string {
  const parts = [base];
  if (room?.trim()) parts.push(`Room ${room.trim()}`);
  if (floor?.trim()) parts.push(/^floor\s/i.test(floor.trim()) ? floor.trim() : `Floor ${floor.trim()}`);
  if (guestName?.trim()) parts.push(`Guest: ${guestName.trim()}`);
  return parts.join(" • ");
}

function formatOrderForWhatsApp(
  orderId: string,
  items: { restaurantName: string; itemName: string; price: string; quantity: number }[],
  totalPhp: number,
  address: string,
  landmark: string,
  notes: string,
  timeWindow: "asap" | "scheduled",
  scheduledAt?: string,
  customerWhatsapp?: string
) {
  const lines = items.map((i) => `• ${i.itemName} x${i.quantity} - ${i.price}`);
  let text = `Hi! I'd like to place an order.\n\nOrder ID: ${orderId}\n\n${lines.join("\n")}\n\nTotal: ₱${totalPhp.toLocaleString()}\n\nDelivery: ${address.trim()}\nLandmark: ${landmark.trim()}`;
  if (notes.trim()) text += `\nNotes: ${notes.trim()}`;
  if (timeWindow === "scheduled" && scheduledAt) text += `\nDeliver at: ${scheduledAt}`;
  else text += `\nASAP`;
  if (customerWhatsapp?.trim()) {
    text += `\n\nContact me:\nWhatsApp: ${customerWhatsapp.trim()}`;
  }
  return text;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const setLastOrder = useLastOrderStore((s) => s.setLastOrder);
  const { customer, token } = useCustomerAuth();
  const { location: deliveryLocation, setLocation } = useDeliveryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [room, setRoom] = useState("");
  const [floor, setFloor] = useState("");
  const [guestName, setGuestName] = useState("");
  const [notes, setNotes] = useState("");
  const [timeWindow, setTimeWindow] = useState<"asap" | "scheduled">("asap");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [tipPhp, setTipPhp] = useState(0);
  const [priorityDelivery, setPriorityDelivery] = useState(false);
  const [allowSubstitutions, setAllowSubstitutions] = useState(true);
  const [minOrderMap, setMinOrderMap] = useState<Record<string, number>>({});
  const [restaurants, setRestaurants] = useState<{ slug: string; name: string; lat?: number | null; lng?: number | null }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPhp: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<{
    id: string;
    label: string;
    landmark: string;
    deliveryLat: number | null;
    deliveryLng: number | null;
    deliveryZoneId: string | null;
    deliveryZoneName: string | null;
    deliveryDistanceKm: number | null;
    room: string | null;
    floor: string | null;
    guestName: string | null;
  }[]>([]);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setEmail(customer.email || "");
      setWhatsapp(customer.phone || "");
    }
  }, [customer]);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data: { restaurants: { slug: string; name: string; minOrderPhp?: number | null; lat?: number | null; lng?: number | null }[] }) => {
        const map: Record<string, number> = {};
        const list: { slug: string; name: string; lat?: number | null; lng?: number | null }[] = [];
        for (const r of data.restaurants || []) {
          if (r.minOrderPhp != null && r.minOrderPhp > 0) map[r.slug] = r.minOrderPhp;
          list.push({ slug: r.slug, name: r.name, lat: r.lat ?? null, lng: r.lng ?? null });
        }
        setMinOrderMap(map);
        setRestaurants(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const lookupPhone = whatsapp.trim();
    if (lookupPhone.length >= 4) {
      fetch(`/api/addresses?phone=${encodeURIComponent(lookupPhone)}`)
        .then((r) => r.json())
        .then((d) => setSavedAddresses(d.addresses || []))
        .catch(() => setSavedAddresses([]));
    } else {
      setSavedAddresses([]);
    }
  }, [whatsapp]);


  function applySavedAddress(addr: (typeof savedAddresses)[0]) {
    setLandmark(addr.landmark);
    setRoom(addr.room || "");
    setFloor(addr.floor || "");
    setGuestName(addr.guestName || "");
    const dist = addr.deliveryDistanceKm ?? 3;
    if (addr.deliveryLat != null && addr.deliveryLng != null) {
      setLocation({ lat: addr.deliveryLat, lng: addr.deliveryLng, distance: dist, placeName: addr.landmark });
    }
  }

  async function handleSaveAddress() {
    const contactPhone = whatsapp.trim();
    if (!contactPhone || !landmark.trim() || !deliveryLocation) return;
    setSavingAddress(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: contactPhone,
          label: landmark.slice(0, 50),
          landmark: landmark.trim(),
          deliveryLat: deliveryLocation.lat,
          deliveryLng: deliveryLocation.lng,
          deliveryZoneId: deliveryLocation.zoneId,
          deliveryZoneName: deliveryLocation.zoneName,
          deliveryDistanceKm,
          room: room.trim() || undefined,
          floor: floor.trim() || undefined,
          guestName: guestName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data) {
        setSavedAddresses((prev) => [{ ...data, label: data.label || "Saved address" }, ...prev]);
      }
    } catch {
      /* ignore */
    } finally {
      setSavingAddress(false);
    }
  }

  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(0);
  const [referralCreditsPhp, setReferralCreditsPhp] = useState(0);
  const [useReferralCredit, setUseReferralCredit] = useState(0);

  useEffect(() => {
    const lookupPhone = whatsapp.trim();
    if (lookupPhone.length >= 4) {
      Promise.all([
        fetch(`/api/loyalty?phone=${encodeURIComponent(lookupPhone)}`),
        fetch(`/api/referral?phone=${encodeURIComponent(lookupPhone)}`),
      ]).then(async ([lRes, rRes]) => {
        const lData = await lRes.json();
        const rData = await rRes.json();
        setLoyaltyPoints(lData.points ?? 0);
        setReferralCreditsPhp(rData.availableCreditsPhp ?? 0);
      }).catch(() => {});
    } else {
      setLoyaltyPoints(0);
      setReferralCreditsPhp(0);
      setUseLoyaltyPoints(0);
      setUseReferralCredit(0);
    }
  }, [whatsapp]);

  const subtotalPhp = items.reduce((sum, i) => sum + i.priceValue * i.quantity, 0);
  const primaryRestaurant = items.length ? items.find((i) => !(i.isGrocery ?? getIsGroceryBySlug(i.restaurantSlug))) ?? items[0] : null;
  const restaurantData = primaryRestaurant ? restaurants.find((r) => r.slug === primaryRestaurant.restaurantSlug) : null;
  const computedDelivery = deliveryLocation && restaurantData
    ? getDistanceAndFee(deliveryLocation.lat, deliveryLocation.lng, restaurantData.lat, restaurantData.lng)
    : null;
  const deliveryFeePhp = computedDelivery?.feePhp ?? deliveryLocation?.feePhp ?? 0;
  const deliveryDistanceKm = computedDelivery?.distanceKm ?? deliveryLocation?.distance ?? 0;
  const priorityFeePhp = priorityDelivery ? PRIORITY_FEE_PHP : 0;
  const promoDiscountPhp = appliedPromo?.discountPhp ?? 0;
  const loyaltyDiscountPhp = Math.min(Math.floor(useLoyaltyPoints / 10) * 5, subtotalPhp - promoDiscountPhp);
  const referralDiscountPhp = Math.min(useReferralCredit, subtotalPhp - promoDiscountPhp - loyaltyDiscountPhp);
  const totalDiscountPhp = promoDiscountPhp + loyaltyDiscountPhp + referralDiscountPhp;
  const totalPhp = Math.max(0, subtotalPhp - totalDiscountPhp + deliveryFeePhp + tipPhp + priorityFeePhp);

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    setPromoError("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), subtotalPhp }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedPromo({ code: data.code, discountPhp: data.discountPhp });
      } else {
        setPromoError(data.error || "Invalid code");
        setAppliedPromo(null);
      }
    } catch {
      setPromoError("Could not validate code");
      setAppliedPromo(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!whatsapp.trim()) {
      setError("WhatsApp number is required so we can contact you.");
      setLoading(false);
      return;
    }

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

    // Max 1 restaurant + 1 grocery per order
    const uniqueSlugs = [...new Set(items.map((i) => i.restaurantSlug))];
    const isGrocery = (slug: string) => {
      const item = items.find((i) => i.restaurantSlug === slug);
      return item?.isGrocery ?? getIsGroceryBySlug(slug);
    };
    const grocerySlugs = uniqueSlugs.filter(isGrocery);
    const restaurantSlugs = uniqueSlugs.filter((slug) => !isGrocery(slug));
    if (grocerySlugs.length > 1 || restaurantSlugs.length > 1) {
      setError("Each order can include items from at most 1 restaurant and 1 grocery. For more, please place a separate order (new order ID, new driver).");
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
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: whatsapp.trim() || "",
          customerWhatsapp: whatsapp.trim() || undefined,
          customerEmail: email.trim() || undefined,
          deliveryAddress: buildDeliveryAddress(
            address.trim() || deliveryLocation.placeName || `${deliveryLocation.lat}, ${deliveryLocation.lng}`,
            room.trim() || undefined,
            floor.trim() || undefined,
            guestName.trim() || undefined
          ),
          landmark: landmark.trim(),
          deliveryLat: deliveryLocation.lat,
          deliveryLng: deliveryLocation.lng,
          deliveryZoneId: deliveryLocation.zoneId,
          deliveryZoneName: deliveryLocation.zoneName,
          deliveryFeePhp,
          deliveryDistanceKm,
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
          promoCode: appliedPromo?.code,
          discountPhp: appliedPromo?.discountPhp,
          referralCode: referralCode.trim() || undefined,
          loyaltyPointsRedeemed: useLoyaltyPoints > 0 ? useLoyaltyPoints : undefined,
          referralCreditPhp: useReferralCredit > 0 ? useReferralCredit : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      const orderId = data.id;
      const displayScheduled = scheduledAt ? new Date(scheduledAt).toLocaleString() : undefined;
      const fullAddress = buildDeliveryAddress(
        address.trim() || deliveryLocation.placeName || "See landmark",
        room.trim() || undefined,
        floor.trim() || undefined,
        guestName.trim() || undefined
      );
      const whatsappMessage = formatOrderForWhatsApp(
        orderId,
        items,
        totalPhp,
        fullAddress,
        landmark.trim(),
        notes.trim(),
        timeWindow,
        displayScheduled,
        whatsapp.trim() || undefined
      );

      const saveSessionAndRedirect = (id: string) => {
        setLastOrder(items);
        clearCart();
        if (typeof window !== "undefined") {
          sessionStorage.setItem("order-confirmation-wa", whatsappMessage);
          sessionStorage.setItem(
            "order-confirmation-eta",
            JSON.stringify({ distanceKm: deliveryDistanceKm, priority: priorityDelivery })
          );
          sessionStorage.setItem(
            "order-confirmation-meta",
            JSON.stringify({
              orderId: id,
              phone: whatsapp.trim(),
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
                    address: fullAddress,
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
              fullAddress,
              landmark.trim(),
              notes.trim(),
              timeWindow,
              displayScheduled,
              whatsapp.trim() || undefined
            )
          );
          sessionStorage.setItem(
            "order-confirmation-eta",
            JSON.stringify({ distanceKm: deliveryDistanceKm, priority: priorityDelivery })
          );
          sessionStorage.setItem(
            "order-confirmation-meta",
            JSON.stringify({
              orderId,
              phone: whatsapp.trim(),
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
                    address: fullAddress,
                    timeWindow: timeWindow === "scheduled" && scheduledAt ? scheduledAt : "ASAP",
                  }
                : undefined,
            })
          );
        }
      };

      if (paymentMethod === "card") {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const stripeRes = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers,
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">WhatsApp number *</label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Best way to reach you — tourists often use foreign SIMs</p>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="+63 9XX XXX XXXX or 09XX XXX XXXX"
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

          {/* Saved addresses */}
          {savedAddresses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Saved addresses
              </label>
              <div className="flex flex-wrap gap-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => applySavedAddress(addr)}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {addr.label} • {addr.landmark}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Delivery location *
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-left hover:border-primary/50 transition-colors"
              >
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                {deliveryLocation ? (
                  <span className="text-slate-900 dark:text-white">
                    {deliveryLocation.placeName || (primaryRestaurant && deliveryDistanceKm > 0 ? `${deliveryDistanceKm}km from ${primaryRestaurant.restaurantName}` : "Location set")} • ₱{deliveryFeePhp} delivery
                  </span>
                ) : (
                  <span className="text-slate-500">Click to set location on map</span>
                )}
              </button>
              {deliveryLocation && landmark.trim() && (
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  disabled={savingAddress}
                  className="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  {savingAddress ? "Saving..." : "Save"}
                </button>
              )}
            </div>
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

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Room <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Floor <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 2nd floor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Guest name <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Name for reception"
              />
            </div>
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
              <div className="mt-3 space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Quick select</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "12-1pm", date: 0, time: "12:00" },
                    { label: "6-7pm", date: 0, time: "18:00" },
                    { label: "7-8pm", date: 0, time: "19:00" },
                    { label: "Tomorrow 12pm", date: 1, time: "12:00" },
                    { label: "Tomorrow 6pm", date: 1, time: "18:00" },
                  ].map((slot) => {
                    const d = new Date();
                    d.setDate(d.getDate() + slot.date);
                    const dateStr = d.toISOString().slice(0, 10);
                    return (
                      <button
                        key={`${slot.date}-${slot.time}`}
                        type="button"
                        onClick={() => {
                          setScheduledDate(dateStr);
                          setScheduledTime(slot.time);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm ${
                          scheduledDate === dateStr && scheduledTime === slot.time
                            ? "bg-primary text-primary-foreground"
                            : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {slot.date === 0 ? `Today ${slot.label}` : slot.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3">
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Promo code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoError("");
                  if (appliedPromo) setAppliedPromo(null);
                }}
                placeholder="Enter code"
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={!promoCode.trim()}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-red-500 text-sm">{promoError}</p>}
            {appliedPromo && (
              <p className="text-green-600 dark:text-green-400 text-sm">
                {appliedPromo.code}: -₱{appliedPromo.discountPhp.toLocaleString()} applied
              </p>
            )}
            {loyaltyPoints >= 10 && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Use loyalty points ({loyaltyPoints} available, 10 pts = ₱5)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setUseLoyaltyPoints(0)}
                    className={`px-3 py-1.5 rounded text-sm ${useLoyaltyPoints === 0 ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-800"}`}
                  >
                    None
                  </button>
                  {[50, 100, 150, 200].filter((p) => p <= loyaltyPoints).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setUseLoyaltyPoints(p)}
                      className={`px-3 py-1.5 rounded text-sm ${useLoyaltyPoints === p ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-800"}`}
                    >
                      {p} pts (-₱{Math.floor(p / 10) * 5})
                    </button>
                  ))}
                </div>
              </div>
            )}
            {referralCreditsPhp > 0 && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Use referral credit (₱{referralCreditsPhp} available)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUseReferralCredit(0)}
                    className={`px-3 py-1.5 rounded text-sm ${useReferralCredit === 0 ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-800"}`}
                  >
                    None
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseReferralCredit(referralCreditsPhp)}
                    className={`px-3 py-1.5 rounded text-sm ${useReferralCredit > 0 ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-800"}`}
                  >
                    Use ₱{referralCreditsPhp}
                  </button>
                </div>
              </div>
            )}
            <div className="mt-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Referral code (optional)</label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Friend's code"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <h2 className="font-semibold text-slate-900 dark:text-white">Order summary</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Max 1 restaurant + 1 grocery per order. More = separate order (new ID, new driver).</p>
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
              {promoDiscountPhp > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Promo ({appliedPromo?.code})</span>
                  <span>-₱{promoDiscountPhp.toLocaleString()}</span>
                </div>
              )}
              {loyaltyDiscountPhp > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Loyalty points</span>
                  <span>-₱{loyaltyDiscountPhp.toLocaleString()}</span>
                </div>
              )}
              {referralDiscountPhp > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Referral credit</span>
                  <span>-₱{referralDiscountPhp.toLocaleString()}</span>
                </div>
              )}
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
            const cryptoAddress = buildDeliveryAddress(
              address.trim() || deliveryLocation?.placeName || "See landmark",
              room.trim() || undefined,
              floor.trim() || undefined,
              guestName.trim() || undefined
            );
            const wa = formatOrderForWhatsApp(
              pendingOrderId!,
              items,
              totalPhp,
              cryptoAddress,
              landmark.trim(),
              notes.trim(),
              timeWindow,
              displayScheduled ? new Date(displayScheduled).toLocaleString() : undefined,
              whatsapp.trim() || undefined
            );
            setLastOrder(items);
            clearCart();
            if (typeof window !== "undefined") {
              sessionStorage.setItem("order-confirmation-wa", wa);
              sessionStorage.setItem(
                "order-confirmation-eta",
                JSON.stringify({ distanceKm: deliveryDistanceKm, priority: priorityDelivery })
              );
              sessionStorage.setItem(
                "order-confirmation-meta",
                JSON.stringify({
                  orderId: pendingOrderId,
                  phone: whatsapp.trim(),
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

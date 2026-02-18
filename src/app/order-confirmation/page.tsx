"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Package, Headphones, Mail } from "lucide-react";
import { getEtaRange, formatEtaRange } from "@/lib/eta";
import { SUPPORT_WHATSAPP } from "@/config/support";
import { sendOrderReceipt } from "@/lib/emailjs";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [etaRange, setEtaRange] = useState<{ min: number; max: number } | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);

  // Verify/capture payment when returning from Stripe, PayPal, or PayMongo
  useEffect(() => {
    const oid = searchParams.get("id");
    const stripeSessionId = searchParams.get("session_id");
    const paypalSuccess = searchParams.get("paypal");
    const paypalToken = searchParams.get("token");

    if (stripeSessionId && oid) {
      fetch("/api/verify-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: stripeSessionId }),
      }).catch(() => {});
    }
    if (paypalSuccess === "success" && paypalToken && oid) {
      fetch("/api/capture-paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypalOrderId: paypalToken, orderId: oid }),
      }).catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    const etaData = sessionStorage.getItem("order-confirmation-eta");
    if (etaData) {
      try {
        const { distanceKm, priority } = JSON.parse(etaData);
        setEtaRange(getEtaRange(distanceKm ?? 3, priority));
        sessionStorage.removeItem("order-confirmation-eta");
      } catch {
        setEtaRange(getEtaRange(3, false));
      }
    } else {
      setEtaRange(getEtaRange(3, false));
    }

    const meta = sessionStorage.getItem("order-confirmation-meta");
    if (meta) {
      try {
        const { email, receiptData } = JSON.parse(meta);
        if (email && receiptData && !sessionStorage.getItem(`order-receipt-sent-${receiptData.orderId}`)) {
          sessionStorage.setItem(`order-receipt-sent-${receiptData.orderId}`, "1");
          sendOrderReceipt({
            to_email: email,
            customer_name: receiptData.customerName,
            order_id: receiptData.orderId,
            items: receiptData.items,
            subtotal: receiptData.subtotal,
            delivery_fee: receiptData.deliveryFee,
            tip: receiptData.tip,
            priority_fee: receiptData.priorityFee,
            total: receiptData.total,
            landmark: receiptData.landmark,
            address: receiptData.address,
            time_window: receiptData.timeWindow,
          })
            .then(() => setEmailSent(true))
            .catch(() => setEmailSent(false));
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6">
          <CheckCircle2 className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Order placed!
        </h1>
        {orderId && (
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            Order #<code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}</code>
          </p>
        )}
        {etaRange && (
          <p className="text-slate-600 dark:text-slate-400 mb-2 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Est. delivery: {formatEtaRange(etaRange.min, etaRange.max)}
          </p>
        )}
        {emailSent === true && (
          <p className="text-slate-600 dark:text-slate-400 mb-4 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Receipt sent to your email
          </p>
        )}
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          We&apos;ve received your order and will confirm and start preparing shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {orderId && (
            <Link
              href={`/track?id=${orderId}`}
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <Package className="w-4 h-4" />
              Track order
            </Link>
          )}
          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 font-medium"
          >
            <Headphones className="w-4 h-4" />
            Contact customer support
          </a>
          <Link
            href="/"
            className="text-slate-600 dark:text-slate-400 hover:text-orange-600 font-medium"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-slate-500">Loading...</div>
        </main>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}

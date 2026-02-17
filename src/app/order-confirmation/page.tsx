"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "639457014440";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [waMessage, setWaMessage] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("order-confirmation-wa");
    if (stored) {
      setWaMessage(stored);
      sessionStorage.removeItem("order-confirmation-wa");
    }
  }, []);

  const whatsappUrl =
    waMessage && typeof window !== "undefined"
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`
      : `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <main className="pt-16 md:pt-20 min-h-screen">
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Order placed!
        </h1>
        {orderId && (
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Order ID: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{orderId}</code>
          </p>
        )}
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Complete your order by sending it to us on WhatsApp. We&apos;ll confirm and start preparing.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Open WhatsApp to confirm
        </a>
        <div className="mt-8">
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

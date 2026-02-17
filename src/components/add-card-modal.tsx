"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, X } from "lucide-react";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

function AddCardForm({
  clientSecret,
  token,
  onSuccess,
  onClose,
}: {
  clientSecret: string;
  token: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;
    setLoading(true);
    setError("");
    try {
      const { setupIntent, error: confirmErr } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElement },
      });
      if (confirmErr) throw new Error(confirmErr.message || "Card setup failed");
      if (setupIntent?.payment_method) {
        const res = await fetch("/api/payment-methods/attach", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ payment_method_id: setupIntent.payment_method }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save");
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1e293b",
                "::placeholder": { color: "#94a3b8" },
              },
              invalid: { color: "#ef4444" },
            },
          }}
        />
      </div>
      <p className="text-xs text-slate-500">
        Card details are handled securely by Stripe. We never store your full number.
      </p>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save card"}
        </button>
      </div>
    </form>
  );
}

export function AddCardModal({ isOpen, onClose, onSuccess, token }: AddCardModalProps) {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (pk) setStripePromise(loadStripe(pk));
  }, []);

  useEffect(() => {
    if (!isOpen || !token) return;
    setError("");
    setClientSecret(null);
    setLoading(true);
    fetch("/api/payment-methods/setup-intent", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setClientSecret(d.clientSecret || null);
        if (!d.clientSecret) setError(d.error || "Failed to create setup");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add card</h2>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        {!clientSecret ? (
          <div className="py-8 flex justify-center">
            {loading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : <p className="text-red-500">{error}</p>}
          </div>
        ) : stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <AddCardForm clientSecret={clientSecret} token={token} onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        ) : (
          <p className="text-red-500">Stripe not configured</p>
        )}
      </div>
    </div>
  );
}

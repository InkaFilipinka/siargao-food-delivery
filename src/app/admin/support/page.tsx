"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Loader2, Package, Phone, MessageCircle, ArrowRight, MessageSquare, Send, X } from "lucide-react";
import { SUPPORT_WHATSAPP } from "@/config/support";

const STAFF_TOKEN_KEY = "siargao-staff-token";

type SupportTicket = {
  id: string;
  subject: string;
  status: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

type SupportMessage = {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
};

function toWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("0") ? `63${digits.slice(1)}` : digits.startsWith("63") ? digits : `63${digits}`;
  return `https://wa.me/${num}`;
}

type Order = {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string | null;
  landmark: string;
  deliveryAddress: string;
  totalPhp: number;
  timeWindow: string;
  scheduledAt: string | null;
  createdAt: string;
  items: { restaurant_name: string; item_name: string; price: string; quantity: number }[];
};

function formatTime(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AdminSupportPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const getAuthHeaders = (): HeadersInit => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem(STAFF_TOKEN_KEY) : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadTickets = useCallback(() => {
    fetch("/api/support/tickets", { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets || []))
      .catch(() => setTickets([]));
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!selectedTicket) {
      setTicketMessages([]);
      return;
    }
    fetch(`/api/support/tickets/${selectedTicket.id}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => setTicketMessages(d.messages || []))
      .catch(() => setTicketMessages([]));
  }, [selectedTicket]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrders([]);
    if (!query.trim()) return;
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem(STAFF_TOKEN_KEY) : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(
        `/api/orders/search?q=${encodeURIComponent(query.trim())}`,
        { headers }
      );
      const data = await res.json();
      if (res.status === 401) {
        setError("Please sign in at Staff page first.");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Search failed");
        return;
      }
      setOrders(data.orders || []);
    } catch {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Customer support
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Search orders by phone number or order ID
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Phone (09XX...) or Order ID"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
            minLength={3}
          />
        </div>
        <button
          type="submit"
          disabled={loading || query.trim().length < 3}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          Search
        </button>
      </form>

      {error && (
        <p className="text-amber-600 dark:text-amber-400">{error}</p>
      )}

      {orders.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Found {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {orders.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
                    {o.id}
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {o.customerName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {o.landmark}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {o.timeWindow === "scheduled" && o.scheduledAt
                      ? formatTime(o.scheduledAt)
                      : "ASAP"}{" "}
                    · ₱{Number(o.totalPhp).toLocaleString()} · {o.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={toWhatsAppUrl(o.customerWhatsapp || o.customerPhone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${o.customerPhone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    Support
                  </a>
                  <Link
                    href={`/staff/orders?highlight=${o.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90"
                  >
                    Manage
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && query.trim().length >= 3 && orders.length === 0 && !error && (
        <p className="text-slate-500 dark:text-slate-400">
          No orders found. Try a different search.
        </p>
      )}

      <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Support tickets
        </h2>
        {tickets.length === 0 ? (
          <p className="text-sm text-slate-500">No support tickets.</p>
        ) : (
          <div className="flex gap-4">
            <div className="flex-1 space-y-2 max-h-80 overflow-y-auto">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left p-3 rounded-lg border ${
                    selectedTicket?.id === t.id
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <p className="font-medium text-slate-900 dark:text-white">{t.subject}</p>
                  <p className="text-xs text-slate-500">
                    {t.phone || t.email || "—"} · {t.status} · {formatTime(t.updated_at)}
                  </p>
                </button>
              ))}
            </div>
            {selectedTicket && (
              <div className="flex-1 min-w-0 border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-slate-900 dark:text-white">{selectedTicket.subject}</h3>
                  <button onClick={() => setSelectedTicket(null)} className="p-1 text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                  {ticketMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2 rounded-lg text-sm ${
                        m.sender_type === "staff"
                          ? "bg-primary/20 ml-4"
                          : "bg-slate-100 dark:bg-slate-700 mr-4"
                      }`}
                    >
                      <span className="text-xs text-slate-500">{m.sender_type} · {formatTime(m.created_at)}</span>
                      <p className="mt-0.5">{m.message}</p>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!replyText.trim()) return;
                    setSendingReply(true);
                    try {
                      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                        body: JSON.stringify({ message: replyText.trim() }),
                      });
                      if (!res.ok) throw new Error("Failed");
                      const data = await res.json();
                      setTicketMessages((prev) => [...prev, data.message]);
                      setReplyText("");
                      loadTickets();
                    } catch {
                      setError("Failed to send reply");
                    } finally {
                      setSendingReply(false);
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Reply..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <Link
          href="/staff/orders"
          className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
        >
          <Package className="w-4 h-4" />
          Full order list on Staff page
        </Link>
      </div>
    </div>
  );
}

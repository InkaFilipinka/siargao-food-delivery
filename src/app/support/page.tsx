"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Send, Loader2 } from "lucide-react";
import { useCustomerAuth } from "@/contexts/customer-auth-context";

type Ticket = { id: string; subject: string; status: string; created_at: string; updated_at: string };
type Message = { id: string; sender_type: string; message: string; created_at: string };

function formatTime(s: string) {
  return new Date(s).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function SupportPage() {
  const { token } = useCustomerAuth();
  const [mode, setMode] = useState<"list" | "new" | "view">("list");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && mode === "list") {
      fetch("/api/support/tickets", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setTickets(d.tickets || []))
        .catch(() => setTickets([]));
    }
  }, [token, mode]);

  useEffect(() => {
    if (!selectedTicket || !token) return;
    fetch(`/api/support/tickets/${selectedTicket.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => setMessages([]));
  }, [selectedTicket, token]);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTickets((prev) => [{ id: data.ticket.id, subject: data.ticket.subject, status: data.ticket.status, created_at: data.ticket.createdAt, updated_at: data.ticket.createdAt }, ...prev]);
      setSubject("");
      setMessage("");
      setMode("list");
      setSelectedTicket({ id: data.ticket.id, subject: data.ticket.subject, status: data.ticket.status, created_at: data.ticket.createdAt, updated_at: data.ticket.createdAt });
      setMode("view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed");
      setMessages((prev) => [...prev, data.message]);
      setReplyText("");
    } catch {
      setError("Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Support
        </h1>

        {!token ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Log in or sign up to open a support ticket or view your tickets.
            </p>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
            >
              Log in / Sign up
            </Link>
          </div>
        ) : (
          <>
            {mode === "list" && (
              <div className="space-y-4">
                <button
                  onClick={() => setMode("new")}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary font-medium"
                >
                  + New ticket
                </button>
                {tickets.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">No support tickets yet.</p>
                ) : (
                  <div className="space-y-2">
                    {tickets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTicket(t);
                          setMode("view");
                        }}
                        className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary/50"
                      >
                        <p className="font-medium text-slate-900 dark:text-white">{t.subject}</p>
                        <p className="text-xs text-slate-500 mt-1">{t.status} · {formatTime(t.updated_at)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mode === "new" && (
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="e.g. Order issue, payment question"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none"
                    placeholder="Describe your issue..."
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("list")}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-70 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Submit
                  </button>
                </div>
              </form>
            )}

            {mode === "view" && selectedTicket && (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setMode("list");
                    setSelectedTicket(null);
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  ← Back to tickets
                </button>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <h2 className="font-medium text-slate-900 dark:text-white mb-4">{selectedTicket.subject}</h2>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-lg text-sm ${
                          m.sender_type === "customer"
                            ? "bg-primary/10 ml-4"
                            : "bg-slate-100 dark:bg-slate-700 mr-4"
                        }`}
                      >
                        <span className="text-xs text-slate-500">{m.sender_type} · {formatTime(m.created_at)}</span>
                        <p className="mt-1">{m.message}</p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleReply} className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Reply..."
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={loading || !replyText.trim()}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-1"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

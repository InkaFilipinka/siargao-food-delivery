"use client";

import { useCallback } from "react";
import { MapPin, Phone, MessageCircle, Loader2, Package } from "lucide-react";
import { SUPPORT_WHATSAPP } from "@/config/support";
import { cn } from "@/lib/utils";

const KANBAN_COLUMNS = [
  { id: "new", label: "New", statuses: ["pending"] },
  { id: "confirmed", label: "Confirmed", statuses: ["confirmed", "preparing"] },
  { id: "ready", label: "Ready", statuses: ["ready"] },
  { id: "assigned", label: "Assigned", statuses: ["assigned"] },
  { id: "picked", label: "Picked", statuses: ["picked", "out_for_delivery"] },
  { id: "delivered", label: "Delivered", statuses: ["delivered"] },
  { id: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
] as const;

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "assigned",
  assigned: "picked",
  picked: "out_for_delivery",
  out_for_delivery: "delivered",
};

function toWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("0") ? `63${digits.slice(1)}` : digits.startsWith("63") ? digits : `63${digits}`;
  return `https://wa.me/${num}`;
}

export type DispatchOrder = {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string | null;
  landmark: string;
  deliveryAddress: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  totalPhp: number;
  timeWindow: string;
  scheduledAt: string | null;
  createdAt: string;
  items: { restaurant_name: string; item_name: string; price: string; quantity: number }[];
};

function formatTime(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DispatchBoardProps {
  orders: DispatchOrder[];
  onStatusChange: (orderId: string, newStatus: string) => void;
  updatingId: string | null;
  getAuthHeaders: () => Record<string, string>;
}

export function DispatchBoard({
  orders,
  onStatusChange,
  updatingId,
  getAuthHeaders,
}: DispatchBoardProps) {
  const getOrdersInColumn = useCallback(
    (column: (typeof KANBAN_COLUMNS)[number]) => {
      return orders.filter((o) => (column.statuses as readonly string[]).includes(o.status));
    },
    [orders]
  );

  return (
    <div className="overflow-x-auto pb-4 -mx-2">
      <div className="flex gap-4 min-w-max">
        {KANBAN_COLUMNS.map((col) => {
          const colOrders = getOrdersInColumn(col);
          return (
            <div
              key={col.id}
              className={cn(
                "w-64 shrink-0 rounded-xl border flex flex-col max-h-[calc(100vh-12rem)]",
                col.id === "cancelled"
                  ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              )}
            >
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  {col.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                  {colOrders.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {colOrders.map((o) => {
                  const nextStatus = NEXT_STATUS[o.status];
                  const isUpdating = updatingId === o.id;
                  return (
                    <div
                      key={o.id}
                      className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-sm shadow-sm"
                    >
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
                        {String(o.id).slice(0, 8)}…
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white truncate mt-0.5">
                        {o.customerName}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {o.landmark}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ₱{Number(o.totalPhp).toLocaleString()} · {formatTime(o.createdAt)}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <a
                          href={toWhatsAppUrl(o.customerWhatsapp || o.customerPhone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline font-medium"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WA
                        </a>
                        <a
                          href={`tel:${o.customerPhone}`}
                          className="inline-flex items-center gap-1 text-xs text-orange-600 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          Call
                        </a>
                        {o.deliveryLat != null && o.deliveryLng != null && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${o.deliveryLat},${o.deliveryLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-600 hover:underline"
                          >
                            Maps
                          </a>
                        )}
                      </div>
                      {nextStatus && col.id !== "cancelled" && (
                        <button
                          onClick={() => onStatusChange(o.id, nextStatus)}
                          disabled={isUpdating}
                          className="mt-2 w-full py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Package className="w-3 h-3" />
                              → {nextStatus.replace(/_/g, " ")}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

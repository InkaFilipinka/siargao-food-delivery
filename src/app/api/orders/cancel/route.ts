import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const CANCEL_WINDOW_MINUTES = 5;

/** POST /api/orders/cancel - Cancel order within X minutes (customer self-service) */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId, phone } = body;
    if (!orderId?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "orderId and phone required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("id, status, created_at, cancel_cutoff_at, customer_phone")
      .eq("id", orderId.trim())
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const orderPhone = (order.customer_phone || "").replace(/\D/g, "");
    if (orderPhone.length >= 4 && cleanPhone.length >= 4) {
      if (orderPhone.slice(-6) !== cleanPhone.slice(-6)) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    } else if (orderPhone !== cleanPhone) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "cancelled") {
      return NextResponse.json({ ok: true, status: "cancelled" });
    }

    const cutoff = order.cancel_cutoff_at
      ? new Date(order.cancel_cutoff_at).getTime()
      : new Date(order.created_at).getTime() + CANCEL_WINDOW_MINUTES * 60 * 1000;

    if (Date.now() > cutoff) {
      return NextResponse.json(
        { error: `Cancel window expired. Please contact support.` },
        { status: 400 }
      );
    }

    const { error: updateErr } = await supabase
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", orderId.trim());

    if (updateErr) {
      return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: "cancelled" });
  } catch (err) {
    console.error("Order cancel:", err);
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/** POST /api/orders/[id]/confirm-crypto - Mark order as paid after crypto payment (no auth; tx verified manually) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { txHash } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("id, payment_method, payment_status, created_at, notes")
      .eq("id", id)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_method !== "crypto") {
      return NextResponse.json(
        { error: "Order is not a crypto payment" },
        { status: 400 }
      );
    }

    // Optional: only allow confirmation within 1 hour of order creation
    const created = new Date(order.created_at).getTime();
    if (Date.now() - created > 60 * 60 * 1000) {
      return NextResponse.json(
        { error: "Confirmation window expired. Contact support." },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = { payment_status: "paid" };
    if (txHash && typeof txHash === "string" && /^0x[a-fA-F0-9]{60,}$/.test(txHash)) {
      const existingNotes = (order as { notes?: string | null }).notes || "";
      updatePayload.notes = existingNotes.trim()
        ? `${existingNotes}\n[Crypto TX: ${txHash}]`
        : `[Crypto TX: ${txHash}]`;
    }

    const { error: updateErr } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", id);

    if (updateErr) {
      console.error("Confirm crypto error:", updateErr);
      return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Confirm crypto error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

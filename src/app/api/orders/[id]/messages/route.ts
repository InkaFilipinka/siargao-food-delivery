import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function verifyPhone(order: { customer_phone?: string | null }, phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  const orderPhone = (order.customer_phone || "").replace(/\D/g, "");
  if (orderPhone.length >= 4 && cleanPhone.length >= 4) {
    return orderPhone.slice(-6) === cleanPhone.slice(-6);
  }
  return orderPhone === cleanPhone;
}

/** GET /api/orders/[id]/messages?phone=xxx - List messages */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim();
    if (!phone) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: order } = await supabase.from("orders").select("id, customer_phone").eq("id", id).single();
    if (!order || !verifyPhone(order, phone)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: messages } = await supabase
      .from("order_messages")
      .select("id, sender_type, message, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({ messages: messages || [] });
  } catch (err) {
    console.error("Messages GET:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** POST /api/orders/[id]/messages - Add message (customer with phone) */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { phone, message } = body;

    if (!phone?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Phone and message required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: order } = await supabase.from("orders").select("id, customer_phone").eq("id", id).single();
    if (!order || !verifyPhone(order, phone)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("order_messages")
      .insert({
        order_id: id,
        sender_type: "customer",
        sender_id: phone.trim(),
        message: String(message).trim().slice(0, 500),
      })
      .select("id, sender_type, message, created_at")
      .single();

    if (error) {
      console.error("Message insert:", error);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Messages POST:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

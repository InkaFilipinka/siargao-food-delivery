import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { getSlugByRestaurantName } from "@/data/combined";

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

function verifyPhone(order: { customer_phone?: string | null }, phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  const orderPhone = (order.customer_phone || "").replace(/\D/g, "");
  if (orderPhone.length >= 4 && cleanPhone.length >= 4) {
    return orderPhone.slice(-6) === cleanPhone.slice(-6);
  }
  return orderPhone === cleanPhone;
}

async function checkStaffDriverRestaurantAccess(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseAdmin>>>,
  orderId: string,
  token: string
): Promise<{ ok: true; senderType: "staff" | "driver" | "restaurant"; slug?: string } | Response> {
  const staffToken = process.env.STAFF_TOKEN;
  if (staffToken && token === staffToken) {
    return { ok: true, senderType: "staff" };
  }
  const decoded = verifyToken(token);
  if (decoded?.type === "driver") {
    const { data: order } = await supabase.from("orders").select("driver_id").eq("id", orderId).single();
    if (!order || order.driver_id !== decoded.driverId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return { ok: true, senderType: "driver" };
  }
  if (decoded?.type === "restaurant") {
    const { data: items } = await supabase.from("order_items").select("restaurant_name").eq("order_id", orderId);
    const restaurantNames = items?.map((i) => (i as { restaurant_name: string }).restaurant_name) || [];
    const slugs = restaurantNames.map((n) => getSlugByRestaurantName(n)).filter(Boolean);
    if (!slugs.includes(decoded.slug)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return { ok: true, senderType: "restaurant", slug: decoded.slug };
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** GET /api/orders/[id]/messages?phone=xxx - List messages (customer with phone, or staff/driver/restaurant with Bearer token) */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim();
    const token = getBearerToken(request);

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    if (token) {
      const authResult = await checkStaffDriverRestaurantAccess(supabase, id, token);
      if (authResult instanceof Response) return authResult;
      const { data: messages } = await supabase
        .from("order_messages")
        .select("id, sender_type, sender_id, message, created_at")
        .eq("order_id", id)
        .order("created_at", { ascending: true });
      return NextResponse.json({ messages: messages || [] });
    }

    if (!phone) {
      return NextResponse.json({ error: "Phone or auth required" }, { status: 400 });
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

/** POST /api/orders/[id]/messages - Add message (customer with phone, or staff/driver/restaurant with Bearer token) */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { phone, message } = body;
    const token = getBearerToken(request);

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    let senderType: "customer" | "staff" | "driver" | "restaurant";
    let senderId: string;

    if (token) {
      const authResult = await checkStaffDriverRestaurantAccess(supabase, id, token);
      if (authResult instanceof Response) return authResult;
      senderType = authResult.senderType;
      senderId = authResult.slug || authResult.senderType;
    } else {
      if (!phone?.trim()) {
        return NextResponse.json({ error: "Phone or auth required" }, { status: 400 });
      }
      const { data: order } = await supabase.from("orders").select("id, customer_phone").eq("id", id).single();
      if (!order || !verifyPhone(order, phone)) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      senderType = "customer";
      senderId = phone.trim();
    }

    const { data, error } = await supabase
      .from("order_messages")
      .insert({
        order_id: id,
        sender_type: senderType,
        sender_id: senderId,
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

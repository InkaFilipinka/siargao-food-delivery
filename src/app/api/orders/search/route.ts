import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function getStaffToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return new URL(request.url).searchParams.get("token");
}

function requireStaffAuth(request: Request): Response | null {
  const staffToken = process.env.STAFF_TOKEN;
  if (!staffToken) return null;
  const token = getStaffToken(request);
  if (token !== staffToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** GET /api/orders/search?q=... - Search orders by phone or order ID (staff auth) */
export async function GET(request: Request) {
  try {
    const authErr = requireStaffAuth(request);
    if (authErr) return authErr;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    if (!q || q.length < 3) {
      return NextResponse.json(
        { error: "Enter at least 3 characters to search" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const orParts = [`id.ilike.%${q}%`];
    const cleanQ = q.replace(/\D/g, "");
    if (cleanQ.length >= 3) {
      orParts.push(`customer_phone.ilike.%${q}%`);
      if (cleanQ !== q) orParts.push(`customer_phone.ilike.%${cleanQ}%`);
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .or(orParts.join(","))
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Orders search error:", error);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    if (!orders?.length) {
      return NextResponse.json({ orders: [] });
    }

    const orderIds = orders.map((o) => o.id);
    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, restaurant_name, item_name, price, quantity")
      .in("order_id", orderIds);

    const itemsByOrder = new Map<string, typeof items>();
    for (const i of items || []) {
      const list = itemsByOrder.get(i.order_id) || [];
      list.push(i);
      itemsByOrder.set(i.order_id, list);
    }

    const list = orders.map((o) => ({
      id: o.id,
      status: o.status,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      landmark: o.landmark,
      deliveryAddress: o.delivery_address,
      totalPhp: o.total_php,
      timeWindow: o.time_window,
      scheduledAt: o.scheduled_at,
      createdAt: o.created_at,
      confirmedAt: o.confirmed_at,
      readyAt: o.ready_at,
      pickedAt: o.picked_at,
      deliveredAt: o.delivered_at,
      items: itemsByOrder.get(o.id) || [],
    }));

    return NextResponse.json({ orders: list });
  } catch (err) {
    console.error("Orders search error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/** GET /api/orders/history?phone=xxx - Order history by phone (last 6 digits match) */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim();
    if (!phone || phone.length < 4) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ orders: [] });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const tail = cleanPhone.slice(-6);

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, status, total_php, created_at, landmark, estimated_delivery_at, customer_phone")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ orders: [] });
    }

    const filtered = (orders || []).filter((o) => {
      const op = (o.customer_phone || "").replace(/\D/g, "");
      return op.length >= 4 && op.slice(-6) === tail;
    });

    const { data: itemsData } = filtered.length
      ? await supabase
          .from("order_items")
          .select("order_id, restaurant_name, item_name, price, quantity")
          .in(
            "order_id",
            filtered.map((o) => o.id)
          )
      : { data: [] };

    const itemsByOrder = new Map<string, typeof itemsData>();
    for (const i of itemsData || []) {
      const list = itemsByOrder.get(i.order_id) || [];
      list.push(i);
      itemsByOrder.set(i.order_id, list);
    }

    const list = filtered.map((o) => ({
      id: o.id,
      status: o.status,
      totalPhp: o.total_php,
      createdAt: o.created_at,
      landmark: o.landmark,
      estimatedDeliveryAt: o.estimated_delivery_at,
      items: itemsByOrder.get(o.id) || [],
    }));

    return NextResponse.json({ orders: list });
  } catch (err) {
    console.error("Order history:", err);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}

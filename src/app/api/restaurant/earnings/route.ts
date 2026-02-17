import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRestaurantBySlug } from "@/data/combined";
import { verifyToken } from "@/lib/auth";

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return new URL(request.url).searchParams.get("token");
}

function checkAuth(request: Request): { ok: true; slug: string } | Response {
  const token = getBearerToken(request);
  const staffToken = process.env.STAFF_TOKEN;
  const { searchParams } = new URL(request.url);
  const querySlug = searchParams.get("slug")?.trim();

  if (staffToken && token === staffToken) {
    if (!querySlug) return NextResponse.json({ error: "slug required" }, { status: 400 });
    return { ok: true, slug: querySlug };
  }
  const decoded = verifyToken(token || "");
  if (decoded?.type === "restaurant") return { ok: true, slug: decoded.slug };
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** GET /api/restaurant/earnings?slug= - Pending + paid earnings */
export async function GET(request: Request) {
  try {
    const authResult = checkAuth(request);
    if (authResult instanceof Response) return authResult;
    const { slug } = authResult;

    const restaurant = getRestaurantBySlug(slug);
    if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data: deliveredOrders } = await supabase
      .from("orders")
      .select("id, delivered_at")
      .eq("status", "delivered")
      .not("delivered_at", "is", null);

    if (!deliveredOrders?.length) {
      return NextResponse.json({
        pendingPhp: 0,
        paidTotalPhp: 0,
        payouts: [],
      });
    }

    const orderIds = deliveredOrders.map((o) => o.id);
    const deliveredAtById = new Map(deliveredOrders.map((o) => [o.id, o.delivered_at]));

    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, cost_value, quantity")
      .eq("restaurant_name", restaurant.name)
      .in("order_id", orderIds);

    let pendingPhp = 0;
    for (const i of items || []) {
      const deliveredAt = deliveredAtById.get(i.order_id);
      if (deliveredAt && deliveredAt <= twoHoursAgo) {
        pendingPhp += (i.cost_value ?? 0) * (i.quantity || 1);
      }
    }
    pendingPhp = Math.round(pendingPhp * 100) / 100;

    const { data: payouts } = await supabase
      .from("payouts")
      .select("id, amount_php, paid_at, order_ids")
      .eq("recipient_type", "restaurant")
      .eq("recipient_id", slug)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(50);

    const paidTotalPhp = (payouts || []).reduce((s, p) => s + (p.amount_php ?? 0), 0);

    return NextResponse.json({
      pendingPhp,
      paidTotalPhp,
      payouts: (payouts || []).map((p) => ({
        id: p.id,
        amountPhp: p.amount_php,
        paidAt: p.paid_at,
        orderIds: p.order_ids || [],
      })),
    });
  } catch (err) {
    console.error("Restaurant earnings:", err);
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 });
  }
}

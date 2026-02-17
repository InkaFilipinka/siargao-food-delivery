import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { getDeliveryCommissionPct } from "@/lib/restaurant-config";
import { getSlugByRestaurantName } from "@/data/combined";

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return new URL(request.url).searchParams.get("token");
}

function checkAuth(request: Request): { ok: true; driverId: string } | Response {
  const token = getBearerToken(request);
  const staffToken = process.env.STAFF_TOKEN;
  const { searchParams } = new URL(request.url);
  const queryDriverId = searchParams.get("driverId")?.trim();

  if (staffToken && token === staffToken) {
    if (!queryDriverId) return NextResponse.json({ error: "driverId required with staff token" }, { status: 400 });
    return { ok: true, driverId: queryDriverId };
  }
  const decoded = verifyToken(token || "");
  if (decoded?.type === "driver") return { ok: true, driverId: decoded.driverId };
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** GET /api/driver/earnings - Today + paid total + history */
export async function GET(request: Request) {
  try {
    const authResult = checkAuth(request);
    if (authResult instanceof Response) return authResult;
    const { driverId } = authResult;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: configs } = await supabase.from("restaurant_config").select("slug, delivery_commission_pct");
    const commissionBySlug = new Map((configs || []).map((c) => [c.slug, getDeliveryCommissionPct(c)]));

    const { data: orders } = await supabase
      .from("orders")
      .select("id, delivery_fee_php, tip_php, delivered_at, delivery_zone_id")
      .eq("driver_id", driverId)
      .eq("status", "delivered")
      .not("delivered_at", "is", null);

    const orderIds = (orders || []).map((o) => o.id);
    const { data: items } = orderIds.length
      ? await supabase.from("order_items").select("order_id, restaurant_name").in("order_id", orderIds)
      : { data: [] };

    const slugByOrder = new Map<string, string>();
    for (const i of items || []) {
      const slug = getSlugByRestaurantName(i.restaurant_name) ?? i.restaurant_name?.toLowerCase().replace(/\s+/g, "-") ?? "";
      if (!slugByOrder.has(i.order_id)) slugByOrder.set(i.order_id, slug);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartIso = todayStart.toISOString();

    let todayPhp = 0;
    let allTimePhp = 0;
    for (const o of orders || []) {
      const slug = slugByOrder.get(o.id);
      const commissionPct = slug ? (commissionBySlug.get(slug) ?? 30) : 30;
      const driverShare = (1 - commissionPct / 100) * (o.delivery_fee_php ?? 0) + (o.tip_php ?? 0);
      allTimePhp += driverShare;
      if (o.delivered_at && o.delivered_at >= todayStartIso) {
        todayPhp += driverShare;
      }
    }
    todayPhp = Math.round(todayPhp * 100) / 100;
    allTimePhp = Math.round(allTimePhp * 100) / 100;

    const { data: payouts } = await supabase
      .from("payouts")
      .select("id, amount_php, paid_at, order_ids")
      .eq("recipient_type", "driver")
      .eq("recipient_id", driverId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(50);

    const paidTotalPhp = (payouts || []).reduce((s, p) => s + (p.amount_php ?? 0), 0);

    return NextResponse.json({
      todayPhp,
      allTimePhp,
      paidTotalPhp,
      payouts: (payouts || []).map((p) => ({
        id: p.id,
        amountPhp: p.amount_php,
        paidAt: p.paid_at,
        orderIds: p.order_ids || [],
      })),
    });
  } catch (err) {
    console.error("Driver earnings:", err);
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 });
  }
}

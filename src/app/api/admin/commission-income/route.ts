import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSlugByRestaurantName } from "@/data/combined";
import { getCommissionPct, getDeliveryCommissionPct } from "@/lib/restaurant-config";

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

/** Start of today (00:00) in Philippines time (Asia/Manila) as ISO string */
function getTodayStartPH(): string {
  const dateStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Manila" }); // YYYY-MM-DD
  return new Date(`${dateStr}T00:00:00+08:00`).toISOString();
}

/** GET /api/admin/commission-income - Platform commission for last 24h (from midnight PH) */
export async function GET(request: Request) {
  const authErr = requireStaffAuth(request);
  if (authErr) return authErr;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const todayStart = getTodayStartPH();

  const { data: orders, error: ordersErr } = await supabase
    .from("orders")
    .select("id, delivery_fee_php, created_at")
    .gte("created_at", todayStart)
    .neq("status", "cancelled");

  if (ordersErr || !orders?.length) {
    return NextResponse.json({
      periodStart: todayStart,
      byRestaurant: [],
      totalFoodCommissionPhp: 0,
      totalDeliveryCommissionPhp: 0,
      totalCommissionPhp: 0,
    });
  }

  const orderIds = orders.map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, restaurant_name, price_value, cost_value, quantity")
    .in("order_id", orderIds);

  const { data: configs } = await supabase
    .from("restaurant_config")
    .select("slug, commission_pct, delivery_commission_pct");

  const commissionBySlug = new Map(
    (configs || []).map((c) => [c.slug, { food: getCommissionPct(c), delivery: getDeliveryCommissionPct(c) }])
  );

  const orderById = new Map(orders.map((o) => [o.id, o]));

  const byRestaurant = new Map<
    string,
    { slug: string; foodCommissionPhp: number; deliveryCommissionPhp: number }
  >();

  let totalFoodCommissionPhp = 0;
  let totalDeliveryCommissionPhp = 0;

  for (const item of items || []) {
    const slug = getSlugByRestaurantName(item.restaurant_name) ?? item.restaurant_name?.toLowerCase().replace(/\s+/g, "-") ?? "";
    const cfg = commissionBySlug.get(slug);
    const foodPct = cfg?.food ?? 30;

    const priceVal = item.price_value ?? 0;
    const costVal = item.cost_value ?? priceVal / (1 + foodPct / 100);
    const qty = item.quantity ?? 1;
    const foodCommission = (priceVal - costVal) * qty;

    if (!byRestaurant.has(item.restaurant_name)) {
      byRestaurant.set(item.restaurant_name, {
        slug,
        foodCommissionPhp: 0,
        deliveryCommissionPhp: 0,
      });
    }
    const r = byRestaurant.get(item.restaurant_name)!;
    r.foodCommissionPhp += foodCommission;
    totalFoodCommissionPhp += foodCommission;
  }

  for (const order of orders) {
    const itemsInOrder = (items || []).filter((i) => i.order_id === order.id);
    const firstSlug = itemsInOrder[0]
      ? (getSlugByRestaurantName(itemsInOrder[0].restaurant_name) ?? "")
      : "";
    const cfg = commissionBySlug.get(firstSlug);
    const deliveryPct = cfg?.delivery ?? 30;
    const deliveryFee = order.delivery_fee_php ?? 0;
    const deliveryCommission = deliveryFee * (deliveryPct / 100);

    if (itemsInOrder.length > 0) {
      const r = byRestaurant.get(itemsInOrder[0].restaurant_name);
      if (r) {
        r.deliveryCommissionPhp += deliveryCommission;
      }
    }
    totalDeliveryCommissionPhp += deliveryCommission;
  }

  const byRestaurantList = Array.from(byRestaurant.entries()).map(([name, data]) => ({
    restaurantName: name,
    slug: data.slug,
    foodCommissionPhp: Math.round(data.foodCommissionPhp * 100) / 100,
    deliveryCommissionPhp: Math.round(data.deliveryCommissionPhp * 100) / 100,
    totalCommissionPhp: Math.round((data.foodCommissionPhp + data.deliveryCommissionPhp) * 100) / 100,
  }));

  return NextResponse.json({
    periodStart: todayStart,
    periodLabel: "Today (from midnight, Asia/Manila)",
    byRestaurant: byRestaurantList.sort((a, b) => b.totalCommissionPhp - a.totalCommissionPhp),
    totalFoodCommissionPhp: Math.round(totalFoodCommissionPhp * 100) / 100,
    totalDeliveryCommissionPhp: Math.round(totalDeliveryCommissionPhp * 100) / 100,
    totalCommissionPhp: Math.round((totalFoodCommissionPhp + totalDeliveryCommissionPhp) * 100) / 100,
  });
}

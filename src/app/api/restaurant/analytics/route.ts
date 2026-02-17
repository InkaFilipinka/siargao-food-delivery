import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSlugByRestaurantName } from "@/data/combined";

/** GET /api/restaurant/analytics?slug=xxx&days=7 - Order count and revenue by day */
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");
    const days = Math.min(90, Math.max(7, parseInt(request.nextUrl.searchParams.get("days") || "7", 10)));
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    const startStr = start.toISOString();

    const { data: statuses } = await supabase
      .from("order_restaurant_status")
      .select("order_id, status")
      .eq("restaurant_slug", slug)
      .eq("status", "accepted");

    const acceptedOrderIds = new Set((statuses || []).map((s) => s.order_id));
    if (acceptedOrderIds.size === 0) {
      const byDate = new Map<string, { ordersCount: number; revenuePhp: number }>();
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        byDate.set(d.toISOString().slice(0, 10), { ordersCount: 0, revenuePhp: 0 });
      }
      const byDay = Array.from(byDate.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, stats]) => ({ date, ...stats }));
      return NextResponse.json({ byDay, totalOrders: 0, totalRevenuePhp: 0 });
    }

    const { data: orders } = await supabase
      .from("orders")
      .select("id, created_at")
      .in("id", Array.from(acceptedOrderIds))
      .gte("created_at", startStr)
      .neq("status", "cancelled");

    const orderIds = (orders || []).map((o) => o.id);
    if (orderIds.length === 0) {
      const byDate = new Map<string, { ordersCount: number; revenuePhp: number }>();
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        byDate.set(d.toISOString().slice(0, 10), { ordersCount: 0, revenuePhp: 0 });
      }
      const byDay = Array.from(byDate.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, stats]) => ({ date, ...stats }));
      return NextResponse.json({ byDay, totalOrders: 0, totalRevenuePhp: 0 });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, restaurant_name, price_value, quantity")
      .in("order_id", orderIds);

    const ordersByDate = new Map<string, Set<string>>();
    const revenueByDate = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      ordersByDate.set(key, new Set());
      revenueByDate.set(key, 0);
    }

    const orderToCreated = new Map((orders || []).map((o) => [o.id, o.created_at]));

    for (const item of items || []) {
      const itemSlug = getSlugByRestaurantName(item.restaurant_name) ?? item.restaurant_name?.toLowerCase().replace(/\s+/g, "-") ?? "";
      if (itemSlug !== slug) continue;
      const createdAt = orderToCreated.get(item.order_id);
      if (!createdAt) continue;
      const dateKey = new Date(createdAt).toISOString().slice(0, 10);
      ordersByDate.get(dateKey)?.add(item.order_id);
      const rev = (Number(item.price_value) || 0) * (item.quantity || 1);
      revenueByDate.set(dateKey, (revenueByDate.get(dateKey) ?? 0) + rev);
    }

    const byDay = Array.from(ordersByDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, orderSet]) => ({
        date,
        ordersCount: orderSet.size,
        revenuePhp: revenueByDate.get(date) ?? 0,
      }));

    const totalOrders = byDay.reduce((s, d) => s + d.ordersCount, 0);
    const totalRevenue = byDay.reduce((s, d) => s + d.revenuePhp, 0);

    return NextResponse.json({
      byDay,
      totalOrders,
      totalRevenuePhp: totalRevenue,
    });
  } catch (err) {
    console.error("Analytics:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

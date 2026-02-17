import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRestaurantBySlug } from "@/data/combined";
import { verifyToken } from "@/lib/auth";

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return new URL(request.url).searchParams.get("token");
}

/** Resolve slug and auth: staff token allows any slug, restaurant token restricts to that slug */
function checkRestaurantAuth(request: Request): { ok: true; slug: string } | Response {
  const token = getBearerToken(request);
  const staffToken = process.env.STAFF_TOKEN;
  const { searchParams } = new URL(request.url);
  const querySlug = searchParams.get("slug")?.trim();

  if (staffToken && token === staffToken) {
    if (!querySlug) {
      return NextResponse.json({ error: "slug query required with staff token" }, { status: 400 });
    }
    return { ok: true, slug: querySlug };
  }

  const decoded = verifyToken(token || "");
  if (decoded?.type === "restaurant") {
    return { ok: true, slug: decoded.slug };
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** GET /api/restaurant/orders?slug=xxx - Orders with items from this restaurant (staff or restaurant auth) */
export async function GET(request: Request) {
  try {
    const authResult = checkRestaurantAuth(request);
    if (authResult instanceof Response) return authResult;
    const { slug } = authResult;

    const restaurant = getRestaurantBySlug(slug);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("order_id")
      .eq("restaurant_name", restaurant.name);

    if (itemsErr || !items?.length) {
      return NextResponse.json({ orders: [], restaurant: { name: restaurant.name, slug } });
    }

    const orderIds = [...new Set(items.map((i) => i.order_id))];
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .in("id", orderIds)
      .order("created_at", { ascending: false });

    if (ordersErr) {
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    let statusByOrder = new Map<string, { status: string; prep_mins: number | null }>();
    const { data: statusRows } = await supabase
      .from("order_restaurant_status")
      .select("order_id, status, prep_mins")
      .eq("restaurant_slug", slug)
      .in("order_id", orderIds);
    if (statusRows) {
      statusByOrder = new Map(
        statusRows.map((s) => [s.order_id, { status: s.status, prep_mins: s.prep_mins }])
      );
    }

    const { data: allItems } = await supabase
      .from("order_items")
      .select("order_id, restaurant_name, item_name, price, quantity")
      .in("order_id", orderIds);

    const itemsByOrder = new Map<string, typeof allItems>();
    for (const i of allItems || []) {
      const list = itemsByOrder.get(i.order_id) || [];
      list.push(i);
      itemsByOrder.set(i.order_id, list);
    }

    const list = (orders || []).map((o) => {
      const myItems = (itemsByOrder.get(o.id) || []).filter(
        (i) => i.restaurant_name === restaurant.name
      );
      const restStatus = statusByOrder.get(o.id) as { status: string; prep_mins: number | null } | undefined;
      return {
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
        items: myItems,
        restaurantStatus: restStatus?.status ?? "pending",
        prepMins: restStatus?.prep_mins ?? null,
      };
    });

    return NextResponse.json({
      orders: list,
      restaurant: { name: restaurant.name, slug },
    });
  } catch (err) {
    console.error("Restaurant orders error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

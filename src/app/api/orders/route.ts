import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function getStaffToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return new URL(request.url).searchParams.get("token");
}

function requireStaffAuth(request: Request): Response | null {
  const staffToken = process.env.STAFF_TOKEN;
  if (!staffToken) return null; // No auth required when STAFF_TOKEN not set
  const token = getStaffToken(request);
  if (token !== staffToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** GET /api/orders - List all orders for staff (requires STAFF_TOKEN when set) */
export async function GET(request: Request) {
  try {
    const authErr = requireStaffAuth(request);
    if (authErr) return authErr;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Order list requires database" },
        { status: 503 }
      );
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Orders list error:", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const orderIds = (orders || []).map((o) => o.id);
    const { data: items } = orderIds.length
      ? await supabase
          .from("order_items")
          .select("order_id, restaurant_name, item_name, price, quantity")
          .in("order_id", orderIds)
      : { data: [] };

    const itemsByOrder = new Map<string, typeof items>();
    for (const i of items || []) {
      const list = itemsByOrder.get(i.order_id) || [];
      list.push(i);
      itemsByOrder.set(i.order_id, list);
    }

    const list = (orders || []).map((o) => ({
      id: o.id,
      status: o.status,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      landmark: o.landmark,
      deliveryAddress: o.delivery_address,
      deliveryLat: o.delivery_lat ?? null,
      deliveryLng: o.delivery_lng ?? null,
      totalPhp: o.total_php,
      tipPhp: o.tip_php ?? 0,
      paymentMethod: o.payment_method ?? "cash",
      paymentStatus: o.payment_status ?? "pending",
      arrivedAtHubAt: o.arrived_at_hub_at ?? null,
      cashReceivedByDriver: o.cash_received_by_driver ?? null,
      cashTurnedIn: o.cash_turned_in ?? null,
      updatedBy: o.updated_by ?? null,
      timeWindow: o.time_window,
      scheduledAt: o.scheduled_at,
      createdAt: o.created_at,
      confirmedAt: o.confirmed_at,
      readyAt: o.ready_at,
      assignedAt: o.assigned_at,
      pickedAt: o.picked_at,
      deliveredAt: o.delivered_at,
      items: itemsByOrder.get(o.id) || [],
    }));

    return Response.json({ orders: list });
  } catch (err) {
    console.error("Orders GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { sendNtfy } from "@/lib/ntfy";
import { getNtfyTopic } from "@/config/restaurant-extras";
import { getSlugByRestaurantName, getIsGroceryBySlug } from "@/data/combined";
import type { CreateOrderInput, OrderItem } from "@/types/order";

function sendOrderNtfy(orderId: string, items: OrderItem[], landmark: string, customerPhone: string) {
  const byRestaurant = new Map<string, { slug: string; items: OrderItem[] }>();
  for (const item of items) {
    const slug =
      item.restaurantSlug ??
      getSlugByRestaurantName(item.restaurantName) ??
      item.restaurantName.toLowerCase().replace(/\s+/g, "-");
    if (!byRestaurant.has(item.restaurantName)) {
      byRestaurant.set(item.restaurantName, { slug, items: [] });
    }
    byRestaurant.get(item.restaurantName)!.items.push(item);
  }
  const phTime = new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  for (const [restaurantName, { slug, items: restItems }] of byRestaurant) {
    const topic = getNtfyTopic(slug);
    const lines = restItems.map((i) => `• ${i.itemName} x${i.quantity} - ${i.price}`);
    const msg = `🍽️ New order #${String(orderId).slice(0, 8)}

${lines.join("\n")}

📍 ${landmark}
🕐 ${phTime}
📞 ${customerPhone}`;
    sendNtfy(topic, msg, { title: `${restaurantName} - Order`, priority: "high", tags: "plate_with_cutlery" }).catch(() => {});
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateOrderInput = await request.json();

    const {
      customerName,
      customerPhone,
      deliveryAddress,
      landmark,
      deliveryLat,
      deliveryLng,
      deliveryZoneId,
      deliveryZoneName,
      deliveryFeePhp,
      deliveryDistanceKm,
      notes,
      items,
      timeWindow,
      scheduledAt,
      tipPhp,
      priorityDelivery,
      allowSubstitutions,
      paymentMethod,
    } = body;

    if (!customerName?.trim() || !customerPhone?.trim()) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    if (!landmark?.trim()) {
      return NextResponse.json(
        { error: "Landmark is required (e.g. near Bravo, beside...)" },
        { status: 400 }
      );
    }

    const address = deliveryAddress?.trim() || "See landmark";

    if (!items?.length) {
      return NextResponse.json({ error: "Order must have at least one item" }, { status: 400 });
    }

    // Max 1 restaurant + 1 grocery per order
    const getSlug = (i: OrderItem) =>
      (i as { restaurantSlug?: string }).restaurantSlug ?? getSlugByRestaurantName(i.restaurantName) ?? i.restaurantName.toLowerCase().replace(/\s+/g, "-");
    const uniqueSlugs = [...new Set(items.map(getSlug).filter(Boolean))];
    const grocerySlugs = uniqueSlugs.filter((slug) => getIsGroceryBySlug(slug));
    const restaurantSlugs = uniqueSlugs.filter((slug) => !getIsGroceryBySlug(slug));
    if (grocerySlugs.length > 1 || restaurantSlugs.length > 1) {
      return NextResponse.json(
        { error: "Each order can include items from at most 1 restaurant and 1 grocery. For more, please place a separate order." },
        { status: 400 }
      );
    }

    const subtotalPhp = items.reduce((sum, i) => sum + i.priceValue * i.quantity, 0);
    const deliveryFee = deliveryFeePhp ?? 0;
    const tip = tipPhp ?? 0;
    const priorityFee = priorityDelivery ? 50 : 0;
    const totalPhp = subtotalPhp + deliveryFee + tip + priorityFee;

    const supabase = getSupabaseAdmin();

    if (supabase) {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          delivery_address: address,
          landmark: landmark.trim(),
          delivery_lat: deliveryLat ?? null,
          delivery_lng: deliveryLng ?? null,
          delivery_zone_id: deliveryZoneId ?? null,
          delivery_zone_name: deliveryZoneName ?? null,
          delivery_distance_km: deliveryDistanceKm ?? null,
          notes: notes?.trim() || null,
          subtotal_php: subtotalPhp,
          delivery_fee_php: deliveryFee,
          tip_php: tip,
          priority_fee_php: priorityFee,
          total_php: totalPhp,
          status: "pending",
          time_window: timeWindow ?? "asap",
          scheduled_at: scheduledAt ?? null,
          allow_substitutions: allowSubstitutions ?? true,
          payment_method: paymentMethod ?? "cash",
          payment_status: paymentMethod === "cash" ? "pending" : paymentMethod ? "pending" : "pending",
        })
        .select("id, created_at")
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
      }

      const { error: itemsError } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          restaurant_name: i.restaurantName,
          item_name: i.itemName,
          price: i.price,
          price_value: i.priceValue,
          quantity: i.quantity,
        }))
      );

      if (itemsError) {
        console.error("Supabase order_items insert error:", itemsError);
        await supabase.from("orders").delete().eq("id", order.id);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
      }

      sendOrderNtfy(order.id, items, landmark.trim(), customerPhone.trim());

      return NextResponse.json({
        id: order.id,
        createdAt: order.created_at,
      });
    }

    const id = crypto.randomUUID();
    sendOrderNtfy(id, items, landmark.trim(), customerPhone.trim());
    return NextResponse.json({
      id,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

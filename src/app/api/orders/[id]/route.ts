import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { getSlugByRestaurantName, getIsGroceryBySlug } from "@/data/combined";

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return new URL(request.url).searchParams.get("token");
}

/** Returns staff auth or driver auth. Driver can only update their assigned orders. */
function checkOrderUpdateAuth(request: Request): { ok: true; driverId?: string } | Response {
  const token = getBearerToken(request);
  const staffToken = process.env.STAFF_TOKEN;
  if (staffToken && token === staffToken) return { ok: true };
  const decoded = verifyToken(token || "");
  if (decoded?.type === "driver") return { ok: true, driverId: decoded.driverId };
  if (staffToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return { ok: true };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone?.trim()) {
      return NextResponse.json(
        { error: "Phone number required to view order" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Order tracking requires database" },
        { status: 503 }
      );
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify phone: match last 6 digits (handles 63917... vs 0917...)
    const cleanPhone = phone.replace(/\D/g, "");
    const orderPhone = (order.customer_phone || "").replace(/\D/g, "");
    if (orderPhone.length >= 4 && cleanPhone.length >= 4) {
      const orderTail = orderPhone.slice(-6);
      const inputTail = cleanPhone.slice(-6);
      if (orderTail !== inputTail) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    } else if (orderPhone !== cleanPhone) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("id");

    // Restaurant location for map (when order is pending/preparing)
    let restaurantLat: number | null = null;
    let restaurantLng: number | null = null;
    let restaurantSlug: string | null = null;
    const { data: restaurantStatus } = await supabase
      .from("order_restaurant_status")
      .select("restaurant_slug")
      .eq("order_id", id)
      .limit(1)
      .maybeSingle();
    if (restaurantStatus?.restaurant_slug) {
      restaurantSlug = restaurantStatus.restaurant_slug;
    } else if (items?.length) {
      const first = items[0] as { restaurant_name?: string };
      const slug = getSlugByRestaurantName(first.restaurant_name || "") ?? first.restaurant_name?.toLowerCase().replace(/\s+/g, "-");
      if (slug && !getIsGroceryBySlug(slug)) restaurantSlug = slug;
    }
    if (restaurantSlug) {
      const { data: config } = await supabase
        .from("restaurant_config")
        .select("lat, lng")
        .eq("slug", restaurantSlug)
        .maybeSingle();
      if (config?.lat != null && config?.lng != null) {
        restaurantLat = Number(config.lat);
        restaurantLng = Number(config.lng);
      }
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      customerName: order.customer_name,
      deliveryAddress: order.delivery_address,
      landmark: order.landmark,
      notes: order.notes ?? null,
      deliveryLat: order.delivery_lat ?? null,
      deliveryLng: order.delivery_lng ?? null,
      totalPhp: order.total_php,
      timeWindow: order.time_window,
      scheduledAt: order.scheduled_at,
      createdAt: order.created_at,
      confirmedAt: order.confirmed_at,
      readyAt: order.ready_at,
      assignedAt: order.assigned_at,
      pickedAt: order.picked_at,
      deliveredAt: order.delivered_at,
      estimatedDeliveryAt: order.estimated_delivery_at ?? null,
      cancelCutoffAt: order.cancel_cutoff_at ?? null,
      driverArrivedAt: order.driver_arrived_at ?? null,
      driverLat: (order as { driver_lat?: number }).driver_lat ?? null,
      driverLng: (order as { driver_lng?: number }).driver_lng ?? null,
      driverLocationUpdatedAt: (order as { driver_location_updated_at?: string }).driver_location_updated_at ?? null,
      restaurantLat,
      restaurantLng,
      items: items || [],
    });
  } catch (err) {
    console.error("Order fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = checkOrderUpdateAuth(request);
    if (authResult instanceof Response) return authResult;

    const { id } = await params;
    const body = await request.json();
    const {
      status,
      arrivedAtHub,
      driverArrived,
      cashReceived,
      cashTurnedIn,
      cashVarianceReason,
      source,
      paymentStatus,
    } = body;

    const updatePayload: Record<string, unknown> = {};

    if (status != null) {
      const validStatuses = [
        "confirmed",
        "preparing",
        "ready",
        "assigned",
        "picked",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Use: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
      updatePayload.status = status;
      const now = new Date().toISOString();
      if (status === "confirmed" || status === "preparing") updatePayload.confirmed_at = now;
      if (status === "ready") updatePayload.ready_at = now;
      if (status === "assigned") updatePayload.assigned_at = now;
      if (status === "picked") updatePayload.picked_at = now;
      if (status === "delivered") updatePayload.delivered_at = now;

      // ntfy is used for restaurant/driver/admin only, not customers
    }

    if (arrivedAtHub === true) {
      updatePayload.arrived_at_hub_at = new Date().toISOString();
    }
    if (driverArrived === true) {
      updatePayload.driver_arrived_at = new Date().toISOString();
    }
    if (typeof cashReceived === "number") updatePayload.cash_received_by_driver = cashReceived;
    if (typeof cashTurnedIn === "number") updatePayload.cash_turned_in = cashTurnedIn;
    if (typeof cashVarianceReason === "string") updatePayload.cash_variance_reason = cashVarianceReason;
    if (source === "driver" || source === "staff") {
      updatePayload.updated_by = source;
    }
    if (paymentStatus && ["pending", "paid", "failed", "cancelled"].includes(paymentStatus)) {
      updatePayload.payment_status = paymentStatus;
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Status updates require database" },
        { status: 503 }
      );
    }

    if (authResult.driverId) {
      const { data: order } = await supabase.from("orders").select("driver_id").eq("id", id).single();
      if (!order || order.driver_id !== authResult.driverId) {
        return NextResponse.json({ error: "Not assigned to you" }, { status: 403 });
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", id)
      .select("id, status")
      .single();

    if (error) {
      console.error("Order update error:", error);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    // Award loyalty points when delivered
    if (status === "delivered" && data) {
      const { data: ord } = await supabase.from("orders").select("customer_phone, customer_id").eq("id", id).single();
      if (ord?.customer_phone) {
        const { data: cust } = await supabase
          .from("customers")
          .select("id, loyalty_points")
          .eq("phone", ord.customer_phone.trim())
          .maybeSingle();
        if (cust) {
          await supabase
            .from("customers")
            .update({
              loyalty_points: (cust.loyalty_points ?? 0) + 10,
              updated_at: new Date().toISOString(),
            })
            .eq("id", cust.id);
        } else {
          const { data: inserted } = await supabase
            .from("customers")
            .insert({
              phone: ord.customer_phone.trim(),
              loyalty_points: 10,
            })
            .select("id")
            .single();
          if (inserted) {
            await supabase.from("orders").update({ customer_id: inserted.id }).eq("id", id);
          }
        }
      }
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Order PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

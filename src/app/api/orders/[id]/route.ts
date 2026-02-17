import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

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

    return NextResponse.json({
      id: order.id,
      status: order.status,
      customerName: order.customer_name,
      deliveryAddress: order.delivery_address,
      landmark: order.landmark,
      totalPhp: order.total_php,
      timeWindow: order.time_window,
      scheduledAt: order.scheduled_at,
      createdAt: order.created_at,
      confirmedAt: order.confirmed_at,
      readyAt: order.ready_at,
      assignedAt: order.assigned_at,
      pickedAt: order.picked_at,
      deliveredAt: order.delivered_at,
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
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

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

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Status updates require database" },
        { status: 503 }
      );
    }

    const updatePayload: Record<string, unknown> = { status };

    const now = new Date().toISOString();
    if (status === "confirmed") updatePayload.confirmed_at = now;
    if (status === "ready") updatePayload.ready_at = now;
    if (status === "assigned") updatePayload.assigned_at = now;
    if (status === "picked") updatePayload.picked_at = now;
    if (status === "delivered") updatePayload.delivered_at = now;

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

    return NextResponse.json(data);
  } catch (err) {
    console.error("Order PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

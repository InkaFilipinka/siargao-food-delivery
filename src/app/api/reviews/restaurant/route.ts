import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/** POST /api/reviews/restaurant - Submit restaurant review */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { restaurantSlug, orderId, phone, rating, comment } = body;

    if (!restaurantSlug?.trim() || !orderId?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "restaurantSlug, orderId, and phone required" },
        { status: 400 }
      );
    }

    const r = parseInt(String(rating), 10);
    if (isNaN(r) || r < 1 || r > 5) {
      return NextResponse.json(
        { error: "Rating must be 1-5" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id, customer_phone, status")
      .eq("id", orderId.trim())
      .single();

    if (!order || order.status !== "delivered") {
      return NextResponse.json(
        { error: "Order not found or not yet delivered" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const orderPhone = (order.customer_phone || "").replace(/\D/g, "");
    if (orderPhone.length >= 4 && cleanPhone.length >= 4) {
      if (orderPhone.slice(-6) !== cleanPhone.slice(-6)) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    } else if (orderPhone !== cleanPhone) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { error } = await supabase.from("restaurant_reviews").insert({
      restaurant_slug: restaurantSlug.trim(),
      order_id: orderId.trim(),
      phone: phone.trim(),
      rating: r,
      comment: typeof comment === "string" ? comment.trim() || null : null,
    });

    if (error) {
      console.error("Review insert:", error);
      return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Review API:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

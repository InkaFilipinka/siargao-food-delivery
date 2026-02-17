import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSlugByRestaurantName, getIsGroceryBySlug } from "@/data/combined";
import { costFromDisplay, getCommissionPct } from "@/lib/restaurant-config";

function verifyPhone(order: { customer_phone?: string | null }, phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  const orderPhone = (order.customer_phone || "").replace(/\D/g, "");
  if (orderPhone.length >= 4 && cleanPhone.length >= 4) {
    return orderPhone.slice(-6) === cleanPhone.slice(-6);
  }
  return orderPhone === cleanPhone;
}

interface EditItem {
  restaurantName: string;
  restaurantSlug?: string;
  itemName: string;
  price: string;
  priceValue: number;
  quantity: number;
}

/** PATCH /api/orders/[id]/edit - Edit order (notes, landmark, address, items) within cancel window. Customer auth by phone. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { phone, notes, landmark, deliveryAddress, room, floor, guestName, items } = body;

    if (!phone?.trim()) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id, customer_phone, status, cancel_cutoff_at, created_at, delivery_fee_php, tip_php, priority_fee_php, discount_php, promo_code")
      .eq("id", id)
      .single();

    if (!order || !verifyPhone(order, phone)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return NextResponse.json({ error: "Order can no longer be edited" }, { status: 400 });
    }

    const cutoff = order.cancel_cutoff_at ? new Date(order.cancel_cutoff_at).getTime() : new Date(order.created_at).getTime() + 5 * 60 * 1000;
    if (Date.now() > cutoff) {
      return NextResponse.json({ error: "Edit window expired (5 min)" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (typeof notes === "string") updatePayload.notes = notes.trim() || null;
    if (typeof landmark === "string" && landmark.trim()) updatePayload.landmark = landmark.trim();
    if (typeof deliveryAddress === "string") updatePayload.delivery_address = deliveryAddress.trim() || null;

    if (items && Array.isArray(items) && items.length > 0) {
      const editItems = items as EditItem[];
      const getSlug = (i: EditItem) =>
        i.restaurantSlug ?? getSlugByRestaurantName(i.restaurantName) ?? i.restaurantName.toLowerCase().replace(/\s+/g, "-");
      const uniqueSlugs = [...new Set(editItems.map(getSlug).filter(Boolean))];
      const grocerySlugs = uniqueSlugs.filter((s) => getIsGroceryBySlug(s));
      const restaurantSlugs = uniqueSlugs.filter((s) => !getIsGroceryBySlug(s));
      if (grocerySlugs.length > 1 || restaurantSlugs.length > 1) {
        return NextResponse.json({ error: "Max 1 restaurant and 1 grocery per order" }, { status: 400 });
      }

      const subtotalPhp = editItems.reduce((s, i) => s + (i.priceValue || 0) * (i.quantity || 1), 0);
      const deliveryFee = Number(order.delivery_fee_php) ?? 0;
      const tip = Number(order.tip_php) ?? 0;
      const priorityFee = Number(order.priority_fee_php) ?? 0;
      const discount = Math.min(Number(order.discount_php) ?? 0, subtotalPhp);
      const totalPhp = Math.max(0, subtotalPhp - discount + deliveryFee + tip + priorityFee);

      const slugs = [...new Set(editItems.map(getSlug))];
      const { data: configs } = slugs.length
        ? await supabase.from("restaurant_config").select("slug, commission_pct").in("slug", slugs)
        : { data: [] };
      const commissionBySlug = new Map((configs || []).map((c) => [c.slug, getCommissionPct(c)]));

      await supabase.from("order_items").delete().eq("order_id", id);

      const { error: itemsError } = await supabase.from("order_items").insert(
        editItems.map((i) => {
          const slug = getSlug(i);
          const commissionPct = commissionBySlug.get(slug) ?? 30;
          const costValue = Math.round(costFromDisplay(i.priceValue, commissionPct) * 100) / 100;
          return {
            order_id: id,
            restaurant_name: i.restaurantName,
            item_name: i.itemName,
            price: i.price,
            price_value: i.priceValue,
            cost_value: costValue,
            quantity: i.quantity,
          };
        })
      );

      if (itemsError) {
        console.error("Order edit items:", itemsError);
        return NextResponse.json({ error: "Failed to update items" }, { status: 500 });
      }

      updatePayload.subtotal_php = subtotalPhp;
      updatePayload.discount_php = discount;
      updatePayload.total_php = totalPhp;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const { error } = await supabase.from("orders").update(updatePayload).eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Order edit:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

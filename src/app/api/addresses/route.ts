import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/** GET /api/addresses?phone=xxx - List saved addresses by phone */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim();
    if (!phone || phone.length < 4) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ addresses: [] });
    }

    const { data: rows, error } = await supabase
      .from("customer_addresses")
      .select("id, label, landmark, delivery_lat, delivery_lng, delivery_zone_id, delivery_zone_name, delivery_distance_km, room, floor, guest_name, created_at")
      .eq("phone", phone.trim())
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = (rows || []).map((r) => ({
      id: r.id,
      label: r.label || "Saved address",
      landmark: r.landmark,
      deliveryLat: r.delivery_lat ?? null,
      deliveryLng: r.delivery_lng ?? null,
      deliveryZoneId: r.delivery_zone_id ?? null,
      deliveryZoneName: r.delivery_zone_name ?? null,
      deliveryDistanceKm: r.delivery_distance_km ?? null,
      room: r.room ?? null,
      floor: r.floor ?? null,
      guestName: r.guest_name ?? null,
    }));

    return NextResponse.json({ addresses });
  } catch (err) {
    console.error("Addresses API:", err);
    return NextResponse.json({ addresses: [] }, { status: 500 });
  }
}

/** POST /api/addresses - Save address */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      phone,
      label,
      landmark,
      deliveryLat,
      deliveryLng,
      deliveryZoneId,
      deliveryZoneName,
      deliveryDistanceKm,
      room,
      floor,
      guestName,
    } = body;

    if (!phone?.trim() || !landmark?.trim()) {
      return NextResponse.json(
        { error: "Phone and landmark required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("customer_addresses")
      .insert({
        phone: phone.trim(),
        label: label?.trim() || null,
        landmark: landmark.trim(),
        delivery_lat: deliveryLat ?? null,
        delivery_lng: deliveryLng ?? null,
        delivery_zone_id: deliveryZoneId ?? null,
        delivery_zone_name: deliveryZoneName ?? null,
        delivery_distance_km: deliveryDistanceKm ?? null,
        room: room?.trim() || null,
        floor: floor?.trim() || null,
        guest_name: guestName?.trim() || null,
      })
      .select("id, label, landmark, delivery_lat, delivery_lng, delivery_zone_id, delivery_zone_name, delivery_distance_km, room, floor, guest_name")
      .single();

    if (error) {
      console.error("Address insert:", error);
      return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      label: data.label || "Saved address",
      landmark: data.landmark,
      deliveryLat: data.delivery_lat ?? null,
      deliveryLng: data.delivery_lng ?? null,
      deliveryZoneId: data.delivery_zone_id ?? null,
      deliveryZoneName: data.delivery_zone_name ?? null,
      deliveryDistanceKm: data.delivery_distance_km ?? null,
      room: data.room ?? null,
      floor: data.floor ?? null,
      guestName: data.guest_name ?? null,
    });
  } catch (err) {
    console.error("Addresses POST:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

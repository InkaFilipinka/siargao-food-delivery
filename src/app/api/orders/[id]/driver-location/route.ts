import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

/** PUT /api/orders/[id]/driver-location - Update driver location (driver auth) */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getBearerToken(request);
    const decoded = verifyToken(token || "");
    if (decoded?.type !== "driver") {
      return NextResponse.json({ error: "Driver auth required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { lat, lng } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: order } = await supabase.from("orders").select("driver_id").eq("id", id).single();
    if (!order || order.driver_id !== decoded.driverId) {
      return NextResponse.json({ error: "Not assigned to you" }, { status: 403 });
    }

    const { error } = await supabase
      .from("orders")
      .update({
        driver_lat: lat,
        driver_lng: lng,
        driver_location_updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Driver location:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

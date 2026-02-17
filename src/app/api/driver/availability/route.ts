import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

function getDriverId(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const decoded = verifyToken(auth.slice(7));
  return decoded?.type === "driver" ? decoded.driverId : null;
}

/** GET /api/driver/availability - Get current availability */
export async function GET(request: NextRequest) {
  try {
    const driverId = getDriverId(request);
    if (!driverId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const { data, error } = await supabase
      .from("drivers")
      .select("is_available")
      .eq("id", driverId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json({ isAvailable: data.is_available ?? true });
  } catch (err) {
    console.error("Driver availability GET:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** PATCH /api/driver/availability - Toggle availability */
export async function PATCH(request: NextRequest) {
  try {
    const driverId = getDriverId(request);
    if (!driverId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { isAvailable } = body;
    const value = typeof isAvailable === "boolean" ? isAvailable : undefined;
    if (value === undefined) {
      return NextResponse.json({ error: "isAvailable (boolean) required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const { error } = await supabase
      .from("drivers")
      .update({ is_available: value })
      .eq("id", driverId);

    if (error) {
      console.error("Driver availability PATCH:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ isAvailable: value });
  } catch (err) {
    console.error("Driver availability PATCH:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

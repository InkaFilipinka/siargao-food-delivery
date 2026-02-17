import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

/** GET /api/restaurant/settings?slug=xxx - Get hours, min_order (requires restaurant auth) */
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = verifyToken(auth.slice(7));
    if (decoded?.type !== "restaurant" || decoded.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const { data } = await supabase
      .from("restaurant_config")
      .select("hours, min_order_php")
      .eq("slug", slug)
      .single();

    return NextResponse.json({
      hours: data?.hours ?? null,
      minOrderPhp: data?.min_order_php ?? null,
    });
  } catch (err) {
    console.error("Restaurant settings GET:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** PATCH /api/restaurant/settings - Update hours, min_order (requires restaurant auth) */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { slug, hours, minOrderPhp } = body;
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = verifyToken(auth.slice(7));
    if (decoded?.type !== "restaurant" || decoded.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof hours === "string") updates.hours = hours.trim() || null;
    if (typeof minOrderPhp === "number" && minOrderPhp >= 0) updates.min_order_php = minOrderPhp;
    else if (minOrderPhp === null) updates.min_order_php = null;

    const { data, error } = await supabase
      .from("restaurant_config")
      .update(updates)
      .eq("slug", slug)
      .select("hours, min_order_php")
      .single();

    if (error) {
      console.error("Restaurant settings PATCH:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({
      hours: data?.hours ?? null,
      minOrderPhp: data?.min_order_php ?? null,
    });
  } catch (err) {
    console.error("Restaurant settings PATCH:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

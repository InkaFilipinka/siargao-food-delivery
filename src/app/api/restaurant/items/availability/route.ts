import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRestaurantBySlug } from "@/data/combined";

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return new URL(request.url).searchParams.get("token");
}

/** GET /api/restaurant/items/availability?slug=xxx - Item availability (public - for menu display) */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim();
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const restaurant = getRestaurantBySlug(slug);
    if (!restaurant) {
      return NextResponse.json({ availability: {} });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ availability: {} });
    }

    const { data: rows } = await supabase
      .from("item_availability")
      .select("item_name, available")
      .eq("restaurant_slug", slug);

    const availability: Record<string, boolean> = {};
    for (const item of restaurant.menuItems) {
      const row = (rows || []).find((r) => r.item_name === item.name);
      availability[item.name] = row ? row.available : true;
    }
    return NextResponse.json({ availability });
  } catch {
    return NextResponse.json({ availability: {} });
  }
}

/** PATCH /api/restaurant/items/availability - Set item available (staff or restaurant auth) */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { slug, itemName, available } = body as {
      slug?: string;
      itemName?: string;
      available?: boolean;
    };

    if (!slug?.trim() || !itemName?.trim()) {
      return NextResponse.json(
        { error: "slug and itemName required" },
        { status: 400 }
      );
    }

    const token = getBearerToken(request);
    const staffToken = process.env.STAFF_TOKEN;
    const { verifyToken } = await import("@/lib/auth");
    const decoded = verifyToken(token || "");
    const allowed =
      (staffToken && token === staffToken) ||
      (decoded?.type === "restaurant" && decoded.slug === slug.trim());
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = getRestaurantBySlug(slug.trim());
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { error } = await supabase
      .from("item_availability")
      .upsert(
        {
          restaurant_slug: slug.trim(),
          item_name: itemName.trim(),
          available: available !== false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "restaurant_slug,item_name" }
      );

    if (error) {
      console.error("Availability update error:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Availability PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

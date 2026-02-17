import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/** GET /api/restaurants/ratings?slugs=surf-cafe,island-bowl - Get avg ratings by slug */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slugsParam = searchParams.get("slugs");
    const slugs = slugsParam?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

    const supabase = getSupabaseAdmin();
    if (!supabase || slugs.length === 0) {
      return NextResponse.json({ ratings: {} });
    }

    const { data, error } = await supabase
      .from("restaurant_reviews")
      .select("restaurant_slug, rating")
      .in("restaurant_slug", slugs);

    if (error) {
      return NextResponse.json({ ratings: {} });
    }

    const bySlug = new Map<string, { sum: number; count: number }>();
    for (const r of data || []) {
      const s = r.restaurant_slug;
      const entry = bySlug.get(s) ?? { sum: 0, count: 0 };
      entry.sum += r.rating ?? 0;
      entry.count += 1;
      bySlug.set(s, entry);
    }

    const ratings: Record<string, { avg: number; count: number }> = {};
    for (const [slug, { sum, count }] of bySlug) {
      ratings[slug] = { avg: count > 0 ? Math.round((sum / count) * 10) / 10 : 0, count };
    }

    return NextResponse.json({ ratings });
  } catch (err) {
    console.error("Ratings API:", err);
    return NextResponse.json({ ratings: {} }, { status: 500 });
  }
}

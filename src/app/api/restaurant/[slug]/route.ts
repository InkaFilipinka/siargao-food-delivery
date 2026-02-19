import { NextRequest, NextResponse } from "next/server";

/** GET /api/restaurant/[slug] - Fetch single restaurant with Supabase overrides (for restaurant detail page) */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

  const url = new URL(request.url);
  const origin = url.origin;
  try {
    const res = await fetch(`${origin}/api/restaurants`, {
      headers: request.headers,
      cache: "no-store",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(err, { status: res.status });
    }
    const data = await res.json();
    const restaurant = data.restaurants?.find((r: { slug: string }) => r.slug === slug);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }
    return NextResponse.json(restaurant);
  } catch (e) {
    console.error("Restaurant API error:", e);
    return NextResponse.json({ error: "Failed to load restaurant" }, { status: 500 });
  }
}

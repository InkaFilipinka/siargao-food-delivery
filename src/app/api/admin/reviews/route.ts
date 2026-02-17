import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function checkAuth(request: Request): Response | null {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : new URL(request.url).searchParams.get("token");
  if (!process.env.STAFF_TOKEN || token !== process.env.STAFF_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** GET /api/admin/reviews - List restaurant reviews */
export async function GET(request: Request) {
  const authErr = checkAuth(request);
  if (authErr) return authErr;

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ reviews: [] });

  const { data, error } = await supabase
    .from("restaurant_reviews")
    .select("id, restaurant_slug, order_id, phone, rating, comment, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ reviews: [] });

  return NextResponse.json({
    reviews: (data || []).map((r) => ({
      id: r.id,
      restaurantSlug: r.restaurant_slug,
      orderId: r.order_id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
    })),
  });
}

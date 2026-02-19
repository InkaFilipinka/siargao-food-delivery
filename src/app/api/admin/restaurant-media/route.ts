import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function requireStaffAuth(request: Request): Response | null {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const staffToken = process.env.STAFF_TOKEN;
  if (staffToken && token !== staffToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** GET /api/admin/restaurant-media?slug=xxx */
export async function GET(request: Request) {
  const err = requireStaffAuth(request);
  if (err) return err;

  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("restaurant_media")
    .select("slug, logo_url, image_urls")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("restaurant_media GET:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({
    slug,
    logoUrl: data?.logo_url ?? null,
    imageUrls: Array.isArray(data?.image_urls) ? data.image_urls : (data?.image_urls ? [data.image_urls] : []),
  });
}

/** PATCH /api/admin/restaurant-media */
export async function PATCH(request: Request) {
  const err = requireStaffAuth(request);
  if (err) return err;

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const { slug, logoUrl, imageUrls } = body;
  if (!slug || typeof slug !== "string") return NextResponse.json({ error: "slug required" }, { status: 400 });

  const updates: Record<string, unknown> = {
    slug: slug.trim(),
    updated_at: new Date().toISOString(),
  };
  if (typeof logoUrl === "string") updates.logo_url = logoUrl.trim() || null;
  if (Array.isArray(imageUrls)) updates.image_urls = imageUrls.filter((u: unknown) => typeof u === "string");

  const { data, error } = await supabase
    .from("restaurant_media")
    .upsert(updates, { onConflict: "slug" })
    .select("slug, logo_url, image_urls")
    .single();

  if (error) {
    console.error("restaurant_media PATCH:", error);
    return NextResponse.json(
      { error: "Failed to save media", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

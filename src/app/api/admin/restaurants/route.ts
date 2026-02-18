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

/** POST /api/admin/restaurants - Hide, unhide, or add restaurant */
export async function POST(request: Request) {
  const err = requireStaffAuth(request);
  if (err) return err;

  const body = await request.json().catch(() => ({}));
  const { action, slug, name, categories, priceRange, tags, menuUrl } = body;

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  if (action === "add") {
    const n = typeof name === "string" ? name.trim() : "";
    if (!n) return NextResponse.json({ error: "name required" }, { status: 400 });
    const rawSlug = typeof slug === "string" ? slug.trim() : "";
    const s = rawSlug ? rawSlug.toLowerCase().replace(/\s+/g, "-") : n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { error } = await supabase.from("admin_restaurants").upsert(
      {
        slug: s,
        name: n,
        categories: Array.isArray(categories) ? categories : [n],
        price_range: typeof priceRange === "string" ? priceRange : "$$",
        tags: Array.isArray(tags) ? tags : [],
        menu_url: typeof menuUrl === "string" ? menuUrl.trim() || null : null,
      },
      { onConflict: "slug" }
    );
    if (error) {
      console.error("admin_restaurants insert:", error);
      return NextResponse.json({ error: "Failed to add" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "hide" || action === "unhide") {
    if (!slug || typeof slug !== "string") return NextResponse.json({ error: "slug required" }, { status: 400 });
    const slugTrim = slug.trim();
    if (action === "hide") {
      const { error } = await supabase.from("hidden_restaurants").upsert({ slug: slugTrim }, { onConflict: "slug" });
      if (error) {
        console.error("hidden_restaurants insert:", error);
        return NextResponse.json({ error: "Failed to hide" }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from("hidden_restaurants").delete().eq("slug", slugTrim);
      if (error) {
        console.error("hidden_restaurants delete:", error);
        return NextResponse.json({ error: "Failed to unhide" }, { status: 500 });
      }
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

/** DELETE /api/admin/restaurants?slug=xxx - Permanently delete an admin-added restaurant */
export async function DELETE(request: Request) {
  const err = requireStaffAuth(request);
  if (err) return err;

  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { error } = await supabase.from("admin_restaurants").delete().eq("slug", slug);
  if (error) {
    console.error("admin_restaurants delete:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

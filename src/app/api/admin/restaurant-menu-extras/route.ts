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

/** GET /api/admin/restaurant-menu-extras?slug=xxx */
export async function GET(request: Request) {
  const err = requireStaffAuth(request);
  if (err) return err;

  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("restaurant_menu_extras")
    .select("id, item_name, price")
    .eq("slug", slug)
    .order("sort_order")
    .order("created_at");

  if (error) {
    console.error("restaurant_menu_extras GET:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}

/** POST /api/admin/restaurant-menu-extras */
export async function POST(request: Request) {
  const err = requireStaffAuth(request);
  if (err) return err;

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const { slug, itemName, price } = body;
  if (!slug || !itemName?.trim()) return NextResponse.json({ error: "slug and itemName required" }, { status: 400 });

  const priceStr = typeof price === "string" ? price.trim() : typeof price === "number" ? `${price} PHP` : "0 PHP";

  const { data, error } = await supabase
    .from("restaurant_menu_extras")
    .insert({ slug, item_name: itemName.trim(), price: priceStr })
    .select("id, item_name, price")
    .single();

  if (error) {
    console.error("restaurant_menu_extras POST:", error);
    return NextResponse.json({ error: "Failed to add" }, { status: 500 });
  }

  return NextResponse.json(data);
}

/** DELETE /api/admin/restaurant-menu-extras?id=xxx */
export async function DELETE(request: Request) {
  const err = requireStaffAuth(request);
  if (err) return err;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { error } = await supabase.from("restaurant_menu_extras").delete().eq("id", id);

  if (error) {
    console.error("restaurant_menu_extras DELETE:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

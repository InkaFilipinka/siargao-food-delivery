import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";

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
  const { action, slug, name, categories, priceRange, tags, menuUrl, email, password } = body;

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  if (action === "add") {
    const n = typeof name === "string" ? name.trim() : "";
    if (!n) return NextResponse.json({ error: "name required" }, { status: 400 });
    const rawSlug = typeof slug === "string" ? slug.trim() : "";
    const s = rawSlug ? rawSlug.toLowerCase().replace(/\s+/g, "-") : n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const menuUrlStr = typeof menuUrl === "string" ? menuUrl.trim() || null : null;

    // 1. Add to admin_restaurants
    const { error: adminErr } = await supabase.from("admin_restaurants").upsert(
      {
        slug: s,
        name: n,
        categories: Array.isArray(categories) ? categories : [n],
        price_range: typeof priceRange === "string" ? priceRange : "$$",
        tags: Array.isArray(tags) ? tags : [],
        menu_url: menuUrlStr,
      },
      { onConflict: "slug" }
    );
    if (adminErr) {
      console.error("admin_restaurants insert:", adminErr);
      return NextResponse.json({ error: "Failed to add" }, { status: 500 });
    }

    // 2. Create restaurant_config so they can log into restaurant portal (email + password required)
    const emailTrim = typeof email === "string" ? email.trim().toLowerCase() : "";
    const passwordTrim = typeof password === "string" ? password.trim() : "";
    if (emailTrim && passwordTrim) {
      const { data: existing } = await supabase.from("restaurant_config").select("slug").eq("slug", s).maybeSingle();
      const updatePayload = {
        commission_pct: 30,
        delivery_commission_pct: 30,
        email: emailTrim,
        password_hash: hashPassword(passwordTrim),
        menu_url: menuUrlStr,
        updated_at: new Date().toISOString(),
      };
      const { error: configErr } = existing
        ? await supabase.from("restaurant_config").update(updatePayload).eq("slug", s)
        : await supabase.from("restaurant_config").insert({ slug: s, ...updatePayload });
      if (configErr) {
        console.error("restaurant_config upsert:", configErr);
        return NextResponse.json({ error: "Added to list but failed to create portal login" }, { status: 500 });
      }
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

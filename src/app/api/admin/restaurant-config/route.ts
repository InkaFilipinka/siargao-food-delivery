import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";

function getStaffToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return new URL(request.url).searchParams.get("token");
}

function requireStaffAuth(request: Request): Response | null {
  const staffToken = process.env.STAFF_TOKEN;
  if (!staffToken) return null;
  const token = getStaffToken(request);
  if (token !== staffToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** GET /api/admin/restaurant-config - List all restaurant configs */
export async function GET(request: Request) {
  const authErr = requireStaffAuth(request);
  if (authErr) return authErr;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("restaurant_config")
    .select("slug, commission_pct, delivery_commission_pct, gcash_number, email, payout_method, crypto_wallet_address, lat, lng, display_name, whatsapp_number, menu_url, hours, hours_by_day")
    .order("slug");

  if (error) {
    console.error("restaurant_config GET:", error);
    return NextResponse.json({ error: "Failed to fetch configs" }, { status: 500 });
  }

  return Response.json({ configs: data || [] });
}

/** PATCH /api/admin/restaurant-config - Upsert config for a slug */
export async function PATCH(request: Request) {
  const authErr = requireStaffAuth(request);
  if (authErr) return authErr;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const { slug, commission_pct, delivery_commission_pct, gcash_number, email, password, payout_method, crypto_wallet_address, lat, lng, display_name, whatsapp_number, menu_url, hours_by_day } = body;

  if (!slug || typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const trimmedSlug = slug.trim().toLowerCase();
  const updates: Record<string, unknown> = {
    slug: trimmedSlug,
    updated_at: new Date().toISOString(),
    commission_pct: typeof commission_pct === "number" && commission_pct >= 0 ? commission_pct : 30,
    delivery_commission_pct: typeof delivery_commission_pct === "number" && delivery_commission_pct >= 0 ? delivery_commission_pct : 30,
  };
  if (typeof gcash_number === "string") updates.gcash_number = gcash_number.trim() || null;
  if (typeof email === "string") updates.email = email.trim() || null;
  if (typeof payout_method === "string" && ["cash", "gcash", "crypto"].includes(payout_method))
    updates.payout_method = payout_method;
  if (typeof crypto_wallet_address === "string") updates.crypto_wallet_address = crypto_wallet_address.trim() || null;
  if (lat !== undefined) {
    const latNum = typeof lat === "string" ? parseFloat(lat) : lat;
    updates.lat = typeof latNum === "number" && !isNaN(latNum) && latNum >= -90 && latNum <= 90 ? latNum : null;
  }
  if (lng !== undefined) {
    const lngNum = typeof lng === "string" ? parseFloat(lng) : lng;
    updates.lng = typeof lngNum === "number" && !isNaN(lngNum) && lngNum >= -180 && lngNum <= 180 ? lngNum : null;
  }
  if (typeof password === "string" && password.length > 0) {
    updates.password_hash = hashPassword(password);
  }
  if (typeof display_name === "string") updates.display_name = display_name.trim() || null;
  if (typeof whatsapp_number === "string") updates.whatsapp_number = whatsapp_number.trim() || null;
  if (typeof menu_url === "string") updates.menu_url = menu_url.trim() || null;
  if (hours_by_day !== undefined) {
    if (hours_by_day && typeof hours_by_day === "object" && !Array.isArray(hours_by_day)) {
      const cleaned: Record<string, string> = {};
      for (const k of ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]) {
        const v = (hours_by_day as Record<string, unknown>)[k];
        if (typeof v === "string" && v.trim()) cleaned[k] = v.trim();
      }
      updates.hours_by_day = Object.keys(cleaned).length > 0 ? cleaned : null;
    } else {
      updates.hours_by_day = null;
    }
  }

  // Try update first, then insert if no existing row
  const { data: existing } = await supabase
    .from("restaurant_config")
    .select("slug")
    .eq("slug", trimmedSlug)
    .maybeSingle();

  const updatePayload = { ...updates };
  delete (updatePayload as Record<string, unknown>).slug;

  if (existing) {
    const { data, error } = await supabase
      .from("restaurant_config")
      .update(updatePayload)
      .eq("slug", trimmedSlug)
      .select("slug, commission_pct, delivery_commission_pct, gcash_number, email, payout_method, crypto_wallet_address, lat, lng, display_name, whatsapp_number, menu_url, hours_by_day")
      .single();
    if (error) {
      console.error("restaurant_config UPDATE:", error);
      return NextResponse.json(
        { error: "Failed to save config", details: error.message },
        { status: 500 }
      );
    }
    return Response.json({ config: data });
  }

  const { data, error } = await supabase
    .from("restaurant_config")
    .insert(updates)
    .select("slug, commission_pct, delivery_commission_pct, gcash_number, email, payout_method, crypto_wallet_address, lat, lng, display_name, whatsapp_number, menu_url, hours_by_day")
    .single();
  if (error) {
    console.error("restaurant_config INSERT:", error);
    return NextResponse.json(
      { error: "Failed to save config", details: error.message },
      { status: 500 }
    );
  }
  return Response.json({ config: data });
}

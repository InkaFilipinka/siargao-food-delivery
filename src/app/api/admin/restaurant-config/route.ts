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
    .select("slug, commission_pct, delivery_commission_pct, gcash_number, email, payout_method, crypto_wallet_address, lat, lng")
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
  const { slug, commission_pct, delivery_commission_pct, gcash_number, email, password, payout_method, crypto_wallet_address, lat, lng } = body;

  if (!slug || typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    slug: slug.trim(),
    updated_at: new Date().toISOString(),
  };
  if (typeof commission_pct === "number" && commission_pct >= 0) updates.commission_pct = commission_pct;
  if (typeof delivery_commission_pct === "number" && delivery_commission_pct >= 0)
    updates.delivery_commission_pct = delivery_commission_pct;
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

  const { data, error } = await supabase
    .from("restaurant_config")
    .upsert(updates, { onConflict: "slug" })
    .select("slug, commission_pct, delivery_commission_pct, gcash_number, email, payout_method, crypto_wallet_address, lat, lng")
    .single();

  if (error) {
    console.error("restaurant_config PATCH:", error);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }

  return Response.json({ config: data });
}

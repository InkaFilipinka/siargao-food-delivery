import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function getStaffToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return new URL(request.url).searchParams.get("token");
}

function checkAuth(request: Request): Response | null {
  const token = getStaffToken(request);
  if (!process.env.STAFF_TOKEN || token !== process.env.STAFF_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** GET /api/admin/promos - List all promo codes */
export async function GET(request: Request) {
  const authErr = checkAuth(request);
  if (authErr) return authErr;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ promos: [] });
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .select("id, code, discount_type, discount_value, min_order_php, max_uses, uses_count, valid_from, valid_until, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch", promos: [] });
  }

  return NextResponse.json({
    promos: (data || []).map((p) => ({
      id: p.id,
      code: p.code,
      discountType: p.discount_type,
      discountValue: p.discount_value,
      minOrderPhp: p.min_order_php ?? 0,
      maxUses: p.max_uses ?? null,
      usesCount: p.uses_count ?? 0,
      validFrom: p.valid_from,
      validUntil: p.valid_until,
      createdAt: p.created_at,
    })),
  });
}

/** POST /api/admin/promos - Create promo code */
export async function POST(request: Request) {
  const authErr = checkAuth(request);
  if (authErr) return authErr;

  const body = await request.json().catch(() => ({}));
  const { code, discountType, discountValue, minOrderPhp, maxUses, validUntil } = body;

  if (!code?.trim() || !discountType || !discountValue) {
    return NextResponse.json(
      { error: "code, discountType, discountValue required" },
      { status: 400 }
    );
  }
  if (!["percent", "fixed"].includes(discountType)) {
    return NextResponse.json({ error: "discountType must be percent or fixed" }, { status: 400 });
  }
  const val = parseFloat(String(discountValue));
  if (isNaN(val) || val <= 0) {
    return NextResponse.json({ error: "discountValue must be positive" }, { status: 400 });
  }
  if (discountType === "percent" && val > 100) {
    return NextResponse.json({ error: "percent discount cannot exceed 100" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code: String(code).trim().toUpperCase(),
      discount_type: discountType,
      discount_value: val,
      min_order_php: parseFloat(String(minOrderPhp)) || 0,
      max_uses: maxUses ? parseInt(String(maxUses), 10) : null,
      valid_until: validUntil || null,
    })
    .select("id, code, discount_type, discount_value")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Code already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }

  return NextResponse.json(data);
}

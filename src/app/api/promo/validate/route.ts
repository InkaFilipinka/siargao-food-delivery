import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/** POST /api/promo/validate - Validate promo code, return discount */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code, subtotalPhp } = body;
    if (!code?.trim() || typeof subtotalPhp !== "number") {
      return NextResponse.json({ error: "code and subtotalPhp required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ valid: false, discountPhp: 0 });
    }

    const { data: promo, error } = await supabase
      .from("promo_codes")
      .select("id, discount_type, discount_value, min_order_php, max_uses, uses_count, valid_from, valid_until")
      .eq("code", code.trim().toUpperCase())
      .maybeSingle();

    if (error || !promo) {
      return NextResponse.json({ valid: false, discountPhp: 0, error: "Invalid code" });
    }

    const now = new Date().toISOString();
    if (promo.valid_from && promo.valid_from > now) {
      return NextResponse.json({ valid: false, discountPhp: 0, error: "Code not yet valid" });
    }
    if (promo.valid_until && promo.valid_until < now) {
      return NextResponse.json({ valid: false, discountPhp: 0, error: "Code expired" });
    }
    if (promo.max_uses != null && (promo.uses_count ?? 0) >= promo.max_uses) {
      return NextResponse.json({ valid: false, discountPhp: 0, error: "Code limit reached" });
    }
    if (subtotalPhp < (promo.min_order_php ?? 0)) {
      return NextResponse.json({
        valid: false,
        discountPhp: 0,
        error: `Minimum order ₱${(promo.min_order_php ?? 0).toLocaleString()}`,
      });
    }

    let discountPhp = 0;
    if (promo.discount_type === "percent") {
      discountPhp = Math.round(subtotalPhp * (promo.discount_value / 100) * 100) / 100;
    } else {
      discountPhp = Math.min(promo.discount_value, subtotalPhp);
    }

    return NextResponse.json({
      valid: true,
      discountPhp,
      code: code.trim().toUpperCase(),
    });
  } catch (err) {
    console.error("Promo validate:", err);
    return NextResponse.json({ valid: false, discountPhp: 0 }, { status: 500 });
  }
}

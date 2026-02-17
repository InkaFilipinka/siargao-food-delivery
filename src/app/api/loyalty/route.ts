import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const POINTS_PER_ORDER = 10;

/** GET /api/loyalty?phone=xxx - Get loyalty points by phone */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim();
    if (!phone || phone.length < 4) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ points: 0 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const tail = cleanPhone.slice(-6);

    const { data: customers } = await supabase
      .from("customers")
      .select("id, loyalty_points")
      .or(`phone.eq.${phone},phone.like.%${tail}`)
      .limit(1);

    const customer = customers?.[0];
    return NextResponse.json({
      points: customer?.loyalty_points ?? 0,
      pointsPerOrder: POINTS_PER_ORDER,
    });
  } catch (err) {
    console.error("Loyalty API:", err);
    return NextResponse.json({ points: 0 }, { status: 500 });
  }
}

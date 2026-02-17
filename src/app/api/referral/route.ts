import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** GET /api/referral?phone=xxx - Get or create referral code */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim();
    if (!phone || phone.length < 4) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ code: null, credits: 0 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const tail = cleanPhone.slice(-6);

    let { data: customer } = await supabase
      .from("customers")
      .select("id, referral_code")
      .or(`phone.eq.${phone},phone.like.%${tail}`)
      .maybeSingle();

    if (!customer) {
      const code = generateReferralCode();
      const { data: inserted } = await supabase
        .from("customers")
        .insert({ phone: phone.trim(), referral_code: code })
        .select("id, referral_code")
        .single();
      customer = inserted;
    } else if (!customer.referral_code) {
      const code = generateReferralCode();
      await supabase
        .from("customers")
        .update({ referral_code: code, updated_at: new Date().toISOString() })
        .eq("id", customer.id);
      customer = { ...customer, referral_code: code };
    }

    const { data: appliedCredits } = await supabase
      .from("referral_credits")
      .select("amount_php")
      .eq("referrer_id", customer?.id)
      .eq("status", "applied");
    const { data: pendingCredits } = await supabase
      .from("referral_credits")
      .select("id, amount_php")
      .eq("referrer_id", customer?.id)
      .eq("status", "pending");

    const totalApplied = (appliedCredits || []).reduce((sum, c) => sum + (c.amount_php ?? 0), 0);
    const availableCredits = (pendingCredits || []).reduce((sum, c) => sum + (c.amount_php ?? 0), 0);

    return NextResponse.json({
      code: customer?.referral_code ?? null,
      totalCreditsPhp: totalApplied,
      availableCreditsPhp: availableCredits,
      pendingCreditIds: (pendingCredits || []).map((c) => c.id),
    });
  } catch (err) {
    console.error("Referral API:", err);
    return NextResponse.json({ code: null, credits: 0 }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createToken } from "@/lib/auth";

/** POST /api/auth/customer/login - Phone number only */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone } = body;
    const phoneTrim = phone?.trim();
    if (!phoneTrim) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const normalized = phoneTrim.replace(/\D/g, "");
    let { data, error } = await supabase
      .from("customers")
      .select("id, email, phone, name")
      .eq("phone", phoneTrim)
      .maybeSingle();
    if ((error || !data) && normalized !== phoneTrim) {
      const res = await supabase
        .from("customers")
        .select("id, email, phone, name")
        .eq("phone", normalized)
        .maybeSingle();
      data = res.data;
      error = res.error;
    }

    if (error || !data?.id) {
      return NextResponse.json({ error: "No account found. Place an order first to create your account." }, { status: 401 });
    }

    const token = createToken({ type: "customer", customerId: data.id, exp: 0 });
    return NextResponse.json({
      token,
      customer: {
        id: data.id,
        email: data.email,
        phone: data.phone,
        name: data.name,
      },
    });
  } catch (err) {
    console.error("Customer login:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

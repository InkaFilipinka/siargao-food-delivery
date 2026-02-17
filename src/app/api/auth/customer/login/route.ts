import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyPassword, createToken } from "@/lib/auth";

/** POST /api/auth/customer/login - Email or phone + password */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, phone, password } = body;
    const identifier = email?.trim() || phone?.trim();
    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/phone and password required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const isEmail = identifier.includes("@");
    let query = supabase.from("customers").select("id, email, phone, name, password_hash");
    if (isEmail) {
      query = query.eq("email", identifier.toLowerCase());
    } else {
      const normalized = identifier.replace(/\D/g, "");
      if (normalized.length >= 10) {
        query = query.or(`phone.eq.${identifier.trim()},phone.eq.${normalized}`);
      } else {
        query = query.eq("phone", identifier.trim());
      }
    }
    const { data, error } = await query.maybeSingle();

    if (error || !data?.id || !data?.password_hash) {
      return NextResponse.json({ error: "Invalid email/phone or password" }, { status: 401 });
    }

    if (!verifyPassword(password, data.password_hash)) {
      return NextResponse.json({ error: "Invalid email/phone or password" }, { status: 401 });
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

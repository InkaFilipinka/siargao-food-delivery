import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hashPassword, createToken } from "@/lib/auth";

/** POST /api/auth/customer/signup */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, phone, name, password } = body;
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    const hasEmail = email?.trim();
    const hasPhone = phone?.trim();
    if (!hasEmail && !hasPhone) {
      return NextResponse.json({ error: "Email or phone required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const passwordHash = hashPassword(password);

    // Check existing
    if (hasEmail) {
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("email", hasEmail.toLowerCase())
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
    }
    if (hasPhone) {
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", hasPhone.trim())
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ error: "Phone already registered" }, { status: 400 });
      }
    }

    const insertData: Record<string, unknown> = {
      password_hash: passwordHash,
      name: name?.trim() || null,
    };
    if (hasEmail) insertData.email = hasEmail.toLowerCase();
    if (hasPhone) insertData.phone = hasPhone.trim();

    const { data, error } = await supabase
      .from("customers")
      .insert(insertData)
      .select("id, email, phone, name")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Email or phone already registered" }, { status: 400 });
      }
      console.error("Signup:", error);
      return NextResponse.json({ error: "Signup failed" }, { status: 500 });
    }

    const token = createToken({ type: "customer", customerId: data.id, exp: 0 });
    return NextResponse.json({
      token,
      customer: { id: data.id, email: data.email, phone: data.phone, name: data.name },
    });
  } catch (err) {
    console.error("Customer signup:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}

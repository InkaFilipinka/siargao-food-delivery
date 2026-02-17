import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyPassword, createToken } from "@/lib/auth";

/** POST /api/auth/restaurant/login - Email + password, returns JWT for restaurant portal */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;
    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("restaurant_config")
      .select("slug, password_hash")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (error || !data?.slug || !data?.password_hash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!verifyPassword(password, data.password_hash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = createToken({ type: "restaurant", slug: data.slug, exp: 0 });
    return NextResponse.json({ token, slug: data.slug });
  } catch (err) {
    console.error("Restaurant login:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

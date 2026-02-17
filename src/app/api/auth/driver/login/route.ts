import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyPassword, createToken } from "@/lib/auth";

/** POST /api/auth/driver/login - Email + password, returns JWT for driver portal */
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
      .from("drivers")
      .select("id, password_hash")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (error || !data?.id || !data?.password_hash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!verifyPassword(password, data.password_hash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = createToken({ type: "driver", driverId: data.id, exp: 0 });
    return NextResponse.json({ token, driverId: data.id });
  } catch (err) {
    console.error("Driver login:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

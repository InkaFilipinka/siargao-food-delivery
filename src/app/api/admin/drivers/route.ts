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

/** GET /api/admin/drivers - List drivers */
export async function GET(request: Request) {
  const authErr = requireStaffAuth(request);
  if (authErr) return authErr;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("drivers")
    .select("id, name, phone, email, gcash_number, is_available, payout_method, crypto_wallet_address")
    .order("name");

  if (error) {
    console.error("drivers GET:", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }

  return Response.json({ drivers: data || [] });
}

/** POST /api/admin/drivers - Create new driver */
export async function POST(request: Request) {
  const authErr = requireStaffAuth(request);
  if (authErr) return authErr;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const { name, phone, email, password } = body;

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  const insert: Record<string, unknown> = {
    name: name.trim(),
    phone: phone.trim(),
  };
  if (typeof email === "string" && email.trim()) {
    insert.email = email.trim();
  }
  if (typeof password === "string" && password.length > 0) {
    insert.password_hash = hashPassword(password);
  }

  const { data, error } = await supabase
    .from("drivers")
    .insert(insert)
    .select("id, name, phone, email, gcash_number, is_available, payout_method, crypto_wallet_address")
    .single();

  if (error) {
    console.error("drivers POST:", error);
    return NextResponse.json({ error: "Failed to create driver" }, { status: 500 });
  }

  return Response.json({ driver: data });
}

/** PATCH /api/admin/drivers - Update driver (email, password, gcash) */
export async function PATCH(request: Request) {
  const authErr = requireStaffAuth(request);
  if (authErr) return authErr;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, email, password, gcash_number, payout_method, crypto_wallet_address } = body;

  if (!id) {
    return NextResponse.json({ error: "Driver id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof email === "string") updates.email = email.trim() || null;
  if (typeof gcash_number === "string") updates.gcash_number = gcash_number.trim() || null;
  if (typeof payout_method === "string" && ["cash", "gcash", "crypto"].includes(payout_method))
    updates.payout_method = payout_method;
  if (typeof crypto_wallet_address === "string") updates.crypto_wallet_address = crypto_wallet_address.trim() || null;
  if (typeof password === "string" && password.length > 0) {
    updates.password_hash = hashPassword(password);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("drivers")
    .update(updates)
    .eq("id", id)
    .select("id, name, phone, email, gcash_number, payout_method, crypto_wallet_address")
    .single();

  if (error) {
    console.error("drivers PATCH:", error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }

  return Response.json({ driver: data });
}

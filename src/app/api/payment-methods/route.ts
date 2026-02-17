import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

function getCustomerId(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const decoded = verifyToken(auth.slice(7));
  return decoded?.type === "customer" ? decoded.customerId : null;
}

/** GET /api/payment-methods - List saved payment methods for logged-in customer */
export async function GET(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("customer_payment_methods")
      .select("id, brand, last4, is_default, created_at")
      .eq("customer_id", customerId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Payment methods fetch:", error);
      return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 });
    }

    return NextResponse.json({
      paymentMethods: (data || []).map((pm) => ({
        id: pm.id,
        brand: pm.brand || "card",
        last4: pm.last4 || "****",
        isDefault: pm.is_default ?? false,
      })),
    });
  } catch (err) {
    console.error("Payment methods GET:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

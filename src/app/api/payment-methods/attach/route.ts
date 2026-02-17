import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

function getStripe() {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(k);
}

function getCustomerId(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const decoded = verifyToken(auth.slice(7));
  return decoded?.type === "customer" ? decoded.customerId : null;
}

/** POST /api/payment-methods/attach - Save a payment method (after SetupIntent confirm) */
export async function POST(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { payment_method_id } = body;
    if (!payment_method_id || typeof payment_method_id !== "string") {
      return NextResponse.json({ error: "payment_method_id required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("id, stripe_customer_id")
      .eq("id", customerId)
      .single();

    if (!customer?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });
    }

    const stripe = getStripe();
    const pm = await stripe.paymentMethods.retrieve(payment_method_id);
    if (pm.customer && String(pm.customer) !== customer.stripe_customer_id) {
      return NextResponse.json({ error: "Payment method belongs to another customer" }, { status: 400 });
    }

    const { count } = await supabase
      .from("customer_payment_methods")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customerId);

    const { data: inserted, error } = await supabase
      .from("customer_payment_methods")
      .insert({
        customer_id: customerId,
        stripe_payment_method_id: pm.id,
        brand: pm.card?.brand ?? null,
        last4: pm.card?.last4 ?? null,
        is_default: (count ?? 0) === 0,
      })
      .select("id, brand, last4, is_default")
      .single();

    if (error) {
      console.error("Attach PM:", error);
      return NextResponse.json({ error: "Failed to save payment method" }, { status: 500 });
    }

    return NextResponse.json({
      id: inserted.id,
      brand: inserted.brand || "card",
      last4: inserted.last4 || "****",
      isDefault: inserted.is_default ?? false,
    });
  } catch (err) {
    console.error("Attach payment method:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

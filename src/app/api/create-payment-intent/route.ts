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

/** POST /api/create-payment-intent - Create PaymentIntent for saved card payment */
export async function POST(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { amount, orderId, paymentMethodId } = body;
    if (!amount || amount <= 0 || !orderId || !paymentMethodId) {
      return NextResponse.json({ error: "amount, orderId, paymentMethodId required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: pmRow } = await supabase
      .from("customer_payment_methods")
      .select("stripe_payment_method_id")
      .eq("id", paymentMethodId)
      .eq("customer_id", customerId)
      .single();

    if (!pmRow?.stripe_payment_method_id) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("id", customerId)
      .single();

    if (!customer?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });
    }

    const stripe = getStripe();
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "php",
      customer: customer.stripe_customer_id,
      payment_method: pmRow.stripe_payment_method_id,
      confirm: true,
      off_session: true,
      automatic_payment_methods: { enabled: false },
      metadata: { orderId, siargao_customer_id: customerId },
    });

    return NextResponse.json({
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
      status: pi.status,
    });
  } catch (err) {
    const stripeErr = err as { type?: string; code?: string; decline_code?: string };
    if (stripeErr.type === "StripeCardError") {
      return NextResponse.json(
        { error: stripeErr.decline_code || "Card declined" },
        { status: 400 }
      );
    }
    console.error("Create PaymentIntent:", err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}

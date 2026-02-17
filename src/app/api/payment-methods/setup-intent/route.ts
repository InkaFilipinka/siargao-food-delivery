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

/** POST /api/payment-methods/setup-intent - Create SetupIntent to add a new card */
export async function POST(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("id, stripe_customer_id, email")
      .eq("id", customerId)
      .single();

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const stripe = getStripe();
    let stripeCustomerId = customer.stripe_customer_id;

    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: customer.email || undefined,
        metadata: { siargao_customer_id: customerId },
      });
      stripeCustomerId = stripeCustomer.id;
      await supabase
        .from("customers")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", customerId);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      usage: "off_session",
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (err) {
    console.error("SetupIntent:", err);
    return NextResponse.json({ error: "Failed to create setup intent" }, { status: 500 });
  }
}

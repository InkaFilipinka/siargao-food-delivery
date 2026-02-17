import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

function getStripe() {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(k);
}

/** POST /api/orders/[id]/confirm-card-payment - Mark order paid after successful PaymentIntent */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json().catch(() => ({}));
    const { paymentIntentId } = body;
    if (!paymentIntentId) {
      return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });
    }

    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }
    const metaOrderId = pi.metadata?.orderId;
    if (metaOrderId !== orderId) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", orderId)
        .eq("payment_method", "card");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Confirm card payment:", err);
    return NextResponse.json({ error: "Failed to confirm" }, { status: 500 });
  }
}

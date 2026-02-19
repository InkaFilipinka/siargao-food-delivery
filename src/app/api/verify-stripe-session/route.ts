import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(secretKey);
}

/** POST - Verify Stripe session and mark order as paid. Body: { sessionId } */
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const orderId = session.metadata?.orderId;
    if (orderId) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const update: Record<string, unknown> = { payment_status: "paid" };
        if (session.payment_intent) {
          const pi =
            typeof session.payment_intent === "string"
              ? await stripe.paymentIntents.retrieve(session.payment_intent)
              : session.payment_intent;
          update.stripe_payment_intent_id = pi.id;
          if (pi.payment_method && typeof pi.payment_method === "string") {
            const pm = await stripe.paymentMethods.retrieve(pi.payment_method);
            if (pm.card) {
              update.card_last4 = pm.card.last4 ?? null;
              update.card_brand = pm.card.brand ?? null;
            }
          }
        }
        await supabase
          .from("orders")
          .update(update)
          .eq("id", orderId)
          .eq("payment_method", "card");
      }
    }

    return NextResponse.json({ ok: true, orderId });
  } catch (err) {
    console.error("Stripe verify error:", err);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}

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
    const customerId = session.metadata?.customerId;
    if (orderId) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase
          .from("orders")
          .update({ payment_status: "paid" })
          .eq("id", orderId)
          .eq("payment_method", "card");
        if (customerId && session.payment_intent) {
          const pi = typeof session.payment_intent === "string"
            ? await stripe.paymentIntents.retrieve(session.payment_intent)
            : session.payment_intent;
          const pmId = pi.payment_method;
          if (pmId && typeof pmId === "string") {
            const pm = await stripe.paymentMethods.retrieve(pmId);
            const { count } = await supabase
              .from("customer_payment_methods")
              .select("id", { count: "exact", head: true })
              .eq("customer_id", customerId);
            await supabase.from("customer_payment_methods").insert({
              customer_id: customerId,
              stripe_payment_method_id: pm.id,
              brand: pm.card?.brand ?? null,
              last4: pm.card?.last4 ?? null,
              is_default: (count ?? 0) === 0,
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true, orderId });
  } catch (err) {
    console.error("Stripe verify error:", err);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}

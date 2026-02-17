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
        await supabase
          .from("orders")
          .update({ payment_status: "paid" })
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

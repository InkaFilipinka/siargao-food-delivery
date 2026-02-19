import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

function getStripe() {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(k);
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

/** POST /api/orders/[id]/refund - Refund a Stripe card payment (staff only) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getBearerToken(request);
    const staffToken = process.env.STAFF_TOKEN;
    if (!staffToken || token !== staffToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const body = await request.json().catch(() => ({}));
    const amountPhp = body.amount != null ? Number(body.amount) : null;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, payment_method, payment_status, total_php, stripe_payment_intent_id")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_method !== "card") {
      return NextResponse.json(
        { error: "Only card payments can be refunded via Stripe" },
        { status: 400 }
      );
    }

    if (order.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Order is not paid" },
        { status: 400 }
      );
    }

    const piId = (order as { stripe_payment_intent_id?: string }).stripe_payment_intent_id;
    if (!piId) {
      return NextResponse.json(
        { error: "No Stripe payment intent found for this order" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const amountToRefund = amountPhp != null && amountPhp > 0
      ? Math.round(amountPhp * 100)
      : undefined;

    const refund = await stripe.refunds.create({
      payment_intent: piId,
      ...(amountToRefund != null ? { amount: amountToRefund } : {}),
    });

    return NextResponse.json({
      ok: true,
      refundId: refund.id,
      status: refund.status,
    });
  } catch (err) {
    console.error("Refund error:", err);
    const stripeErr = err as { type?: string; message?: string };
    const msg = stripeErr.message || "Refund failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

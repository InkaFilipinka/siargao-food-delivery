import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(secretKey);
}

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId, customerEmail, customerName, lineItems } = await request.json();

    if (!amount || amount <= 0 || !orderId) {
      return NextResponse.json({ error: "Invalid amount or orderId" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const stripe = getStripe();
    let customerId: string | undefined;
    let stripeCustomerId: string | undefined;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const decoded = verifyToken(authHeader.slice(7));
      if (decoded?.type === "customer") {
        customerId = decoded.customerId;
        const supabase = getSupabaseAdmin();
        if (supabase) {
          const { data } = await supabase
            .from("customers")
            .select("stripe_customer_id")
            .eq("id", customerId)
            .single();
          if (data?.stripe_customer_id) {
            stripeCustomerId = data.stripe_customer_id;
          } else {
            const c = await stripe.customers.create({
              email: customerEmail || undefined,
              metadata: { siargao_customer_id: customerId },
            });
            stripeCustomerId = c.id;
            await supabase
              .from("customers")
              .update({ stripe_customer_id: stripeCustomerId })
              .eq("id", customerId);
          }
        }
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "payment",
      ...(stripeCustomerId ? { customer: stripeCustomerId } : { customer_email: customerEmail }),
      line_items:
        lineItems?.length > 0
          ? lineItems.map(
              (item: { name: string; amount: number; quantity: number }) => ({
                price_data: {
                  currency: "php",
                  product_data: { name: item.name },
                  unit_amount: Math.round(item.amount * 100),
                },
                quantity: item.quantity,
              })
            )
          : [
              {
                price_data: {
                  currency: "php",
                  product_data: { name: "Food Order" },
                  unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
              },
            ],
      metadata: { orderId, customerName, ...(customerId ? { customerId } : {}) },
      success_url: `${origin}/order-confirmation?id=${orderId}&stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancel=stripe`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    };
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

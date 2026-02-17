import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
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
      metadata: { orderId, customerName },
      success_url: `${origin}/order-confirmation?id=${orderId}&stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancel=stripe`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

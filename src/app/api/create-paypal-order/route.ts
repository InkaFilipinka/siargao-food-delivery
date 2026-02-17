import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal not configured");

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const url = process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com/v1/oauth2/token"
    : "https://api-m.sandbox.paypal.com/v1/oauth2/token";

  const res = await axios.post(
    url,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return res.data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId } = await request.json();

    const clientId = process.env.PAYPAL_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "PayPal not configured" }, { status: 500 });
    }

    if (!amount || amount <= 0 || !orderId) {
      return NextResponse.json({ error: "Invalid amount or orderId" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const token = await getPayPalAccessToken();
    const apiBase = process.env.NODE_ENV === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    const orderRes = await axios.post(
      `${apiBase}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "PHP",
              value: Number(amount).toFixed(2),
            },
            reference_id: orderId,
          },
        ],
        application_context: {
          return_url: `${baseUrl}/order-confirmation?id=${orderId}&paypal=success`,
          cancel_url: `${baseUrl}/checkout?cancel=paypal`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const order = orderRes.data;
    const approveLink = order.links?.find((l: { rel: string }) => l.rel === "approve");
    const approvalUrl = approveLink?.href;

    if (!approvalUrl) {
      return NextResponse.json({ error: "PayPal did not return approval URL" }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      approvalUrl,
    });
  } catch (err) {
    console.error("PayPal order error:", err);
    if (axios.isAxiosError(err) && err.response) {
      return NextResponse.json(
        { error: "PayPal failed", details: err.response.data },
        { status: err.response.status }
      );
    }
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}

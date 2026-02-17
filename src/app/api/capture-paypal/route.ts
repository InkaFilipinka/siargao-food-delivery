import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal not configured");

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const url =
    process.env.NODE_ENV === "production"
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

/** POST - Capture PayPal order after user returns. Body: { paypalOrderId, orderId } */
export async function POST(request: NextRequest) {
  try {
    const { paypalOrderId, orderId } = await request.json();

    if (!paypalOrderId) {
      return NextResponse.json({ error: "PayPal order ID required" }, { status: 400 });
    }

    const token = await getPayPalAccessToken();
    const apiBase =
      process.env.NODE_ENV === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const captureRes = await axios.post(
      `${apiBase}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (captureRes.data.status === "COMPLETED" && orderId) {
      const { getSupabaseAdmin } = await import("@/lib/supabase");
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase
          .from("orders")
          .update({ payment_status: "paid" })
          .eq("id", orderId)
          .eq("payment_method", "paypal");
      }
    }

    return NextResponse.json({ ok: true, status: captureRes.data.status });
  } catch (err) {
    console.error("PayPal capture error:", err);
    if (axios.isAxiosError(err) && err.response) {
      return NextResponse.json(
        { error: "Capture failed", details: err.response.data },
        { status: err.response.status }
      );
    }
    return NextResponse.json({ error: "Failed to capture payment" }, { status: 500 });
  }
}

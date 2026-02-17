import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId, customerEmail, customerName } = await request.json();

    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "PayMongo not configured" }, { status: 500 });
    }

    if (!amount || amount <= 0 || !orderId) {
      return NextResponse.json({ error: "Invalid amount or orderId" }, { status: 400 });
    }

    const amountInCentavos = Math.round(amount * 100);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const sourceData = {
      data: {
        attributes: {
          amount: amountInCentavos,
          currency: "PHP",
          type: "gcash",
          redirect: {
            success: `${baseUrl}/order-confirmation?id=${orderId}&paymongo=success`,
            failed: `${baseUrl}/checkout?cancel=paymongo`,
          },
        },
      },
    };

    const sourceResponse = await axios.post(
      "https://api.paymongo.com/v1/sources",
      sourceData,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(secretKey).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const source = sourceResponse.data.data;
    const checkoutUrl = source.attributes.redirect?.checkout_url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: "PayMongo did not return checkout URL" }, { status: 500 });
    }

    return NextResponse.json({
      checkoutUrl,
      sourceId: source.id,
    });
  } catch (err) {
    console.error("PayMongo error:", err);
    if (axios.isAxiosError(err) && err.response) {
      return NextResponse.json(
        { error: "Payment creation failed", details: err.response.data },
        { status: err.response.status }
      );
    }
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BASE_API_URL}/shipping/fee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: body.address,
        subtotal: body.subtotal,
      }),
      cache: "no-store",
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON from backend", raw: text },
        { status: 500 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Shipping API failed" },
        { status: response.status },
      );
    }

    // ✅ normalize response
    return NextResponse.json({
      shipping_fee: data.shipping_fee ?? data.GIA_CUOC ?? data.data?.fee ?? 0,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getMerchOrder } from "@/lib/orders";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const order = await getMerchOrder(id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json(order, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load order.";
    console.error("Get merch order failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

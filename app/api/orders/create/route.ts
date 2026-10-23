import { NextRequest, NextResponse } from "next/server";
import { createMerchOrder, OrderError } from "@/lib/orders";

export async function POST(request: NextRequest) {
  try {
    const order = await createMerchOrder(await request.json());
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const status = error instanceof OrderError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Could not create order.";
    if (status === 500) console.error("Create merch order failed:", error);
    return NextResponse.json({ error: message }, { status });
  }
}

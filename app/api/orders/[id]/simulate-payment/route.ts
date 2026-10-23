import { NextResponse } from "next/server";
import { OrderError, simulateOrderPayment } from "@/lib/orders";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const order = await simulateOrderPayment(id);
    return NextResponse.json(order);
  } catch (error) {
    const status = error instanceof OrderError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Payment simulation failed.";
    if (status === 500) console.error("Simulated payment failed:", error);
    return NextResponse.json({ error: message }, { status });
  }
}

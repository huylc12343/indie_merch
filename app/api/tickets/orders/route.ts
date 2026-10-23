import { NextRequest, NextResponse } from "next/server";
import { createMerchOrder, OrderError } from "@/lib/orders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body.event_id !== "string" || !Array.isArray(body.items)) return NextResponse.json({ error: "Invalid ticket order." }, { status: 400 });
    const order = await createMerchOrder({
      ...body, shipping_method: "pickup_event", customer_address: "",
      order_items: body.items.map((item: { ticket_type_id?: string; quantity?: number }) => ({ merch_id: item?.ticket_type_id, quantity: item?.quantity })),
    }, "ticket", body.event_id);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (!(error instanceof OrderError)) console.error("Ticket order creation failed:", error);
    return NextResponse.json({ error: error instanceof OrderError ? error.message : "Không tạo được đơn vé." }, { status: error instanceof OrderError ? error.status : 500 });
  }
}

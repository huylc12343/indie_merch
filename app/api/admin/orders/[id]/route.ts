import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { OrderError, setMerchOrderStatus } from "@/lib/orders";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { id } = await context.params;
    const { status } = await request.json();
    if (status !== "done" && status !== "cancel" && status !== "drop") {
      return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
    }
    const order = await setMerchOrderStatus(id, status);
    return NextResponse.json(order);
  } catch (error) {
    const status = error instanceof OrderError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Could not update order.";
    if (status === 500) console.error("Admin order update failed:", error);
    return NextResponse.json({ error: message }, { status });
  }
}

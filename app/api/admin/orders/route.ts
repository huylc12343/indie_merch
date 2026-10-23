import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { listAdminOrders } from "@/lib/orders";

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json(await listAdminOrders(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin order list failed:", error);
    return NextResponse.json({ error: "Could not load orders." }, { status: 503 });
  }
}

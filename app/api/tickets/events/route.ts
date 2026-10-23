import { NextResponse } from "next/server";
import { fetchTicketEvents } from "@/lib/ticket-catalog";

export async function GET() {
  try { return NextResponse.json(await fetchTicketEvents(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    console.error("Ticket catalog failed:", error);
    return NextResponse.json({ error: "Không tải được sự kiện." }, { status: 503 });
  }
}

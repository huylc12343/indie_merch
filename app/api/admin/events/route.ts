import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { listTicketEvents, saveTicketEvent } from "@/lib/ticket-catalog";
import { validateTicketEvent, type TicketEvent } from "@/lib/ticket-data";

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try { return NextResponse.json(await listTicketEvents(true), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { console.error("Admin events failed:", error); return NextResponse.json({ error: "Không tải được sự kiện." }, { status: 503 }); }
}

export async function POST(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let event: TicketEvent;
  try { event = validateTicketEvent({ ...await request.json(), id: crypto.randomUUID() }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Sự kiện không hợp lệ." }, { status: 400 }); }
  try { await saveTicketEvent(event); return NextResponse.json(event, { status: 201 }); }
  catch (error) { console.error("Event creation failed:", error); return NextResponse.json({ error: "Không lưu được sự kiện. Kiểm tra ID, giá và tồn kho hạng vé." }, { status: 409 }); }
}

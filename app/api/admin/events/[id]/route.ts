import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { getDatabase } from "@/lib/db";
import { saveTicketEvent } from "@/lib/ticket-catalog";
import { validateTicketEvent, type TicketEvent } from "@/lib/ticket-data";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  let event: TicketEvent;
  try { event = validateTicketEvent({ ...await request.json(), id }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Sự kiện không hợp lệ." }, { status: 400 }); }
  try {
    const database = await getDatabase();
    if (!(await database.query("SELECT id FROM ticket_events WHERE id=$1", [id])).rows.length) return NextResponse.json({ error: "Không tìm thấy sự kiện." }, { status: 404 });
    await saveTicketEvent(event);
    return NextResponse.json(event);
  } catch (error) { console.error("Event update failed:", error); return NextResponse.json({ error: "Không lưu được sự kiện. Tồn kho phải lớn hơn hoặc bằng số vé đang giữ chỗ." }, { status: 409 }); }
}

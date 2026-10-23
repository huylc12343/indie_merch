export type TicketType = {
  id: string; event_id: string; name: string; description: string; price: number;
  stock_quantity: number; reserved_quantity: number; active: boolean;
};
export type TicketEvent = {
  id: string; name: string; venue: string; starts_at: string;
  description: string; active: boolean; ticket_types: TicketType[];
};
export type TicketOrderPayload = {
  event_id: string; customer_name: string; customer_phone: string; customer_email: string;
  discount_code?: string; items: { ticket_type_id: string; quantity: number }[];
};

export const localEvents: TicketEvent[] = [{
  id: "indie-live-demo", name: "In-đỉ In-đi · Indie Live", venue: "Hà Nội · Sân khấu Indie",
  starts_at: "2026-12-20T12:00:00.000Z", active: true,
  description: "Một đêm nhạc dành cho những tâm hồn đồng điệu. Chọn hạng vé, thanh toán và nhận vé điện tử ngay sau khi xác nhận.",
  ticket_types: [
    { id: "ticket-early", event_id: "indie-live-demo", name: "Early Bird", description: "Vé vào cửa · số lượng giới hạn", price: 199000, stock_quantity: 100, reserved_quantity: 0, active: true },
    { id: "ticket-standard", event_id: "indie-live-demo", name: "Standard", description: "Vé vào cửa đêm nhạc", price: 299000, stock_quantity: 200, reserved_quantity: 0, active: true },
    { id: "ticket-vip", event_id: "indie-live-demo", name: "VIP", description: "Khu vực ưu tiên gần sân khấu", price: 499000, stock_quantity: 50, reserved_quantity: 0, active: true },
  ],
}];

export function validateTicketEvent(value: unknown): TicketEvent {
  if (!value || typeof value !== "object") throw new Error("Thông tin sự kiện không hợp lệ.");
  const input = value as Record<string, unknown>;
  const text = (value: unknown, label: string, max = 200) => {
    if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new Error(`${label} không hợp lệ.`);
    return value.trim();
  };
  const id = typeof input.id === "string" && input.id ? text(input.id, "ID", 100) : crypto.randomUUID();
  const startsAt = new Date(text(input.starts_at, "Thời gian"));
  if (!Number.isFinite(startsAt.getTime())) throw new Error("Thời gian sự kiện không hợp lệ.");
  if (!Array.isArray(input.ticket_types) || !input.ticket_types.length || input.ticket_types.length > 20) throw new Error("Thêm từ 1 đến 20 hạng vé.");
  const ids = new Set<string>();
  const ticket_types = input.ticket_types.map((raw) => {
    if (!raw || typeof raw !== "object") throw new Error("Hạng vé không hợp lệ.");
    const type = raw as Record<string, unknown>;
    const typeId = typeof type.id === "string" && type.id ? text(type.id, "ID vé", 100) : `ticket-${crypto.randomUUID()}`;
    if (ids.has(typeId)) throw new Error("ID hạng vé bị trùng.");
    ids.add(typeId);
    const price = Number(type.price), stock = Number(type.stock_quantity);
    if (!Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(stock) || stock < 0) throw new Error("Giá và số lượng vé phải là số nguyên không âm.");
    return { id: typeId, event_id: id, name: text(type.name, "Tên hạng vé", 160), description: typeof type.description === "string" ? type.description.slice(0, 4000) : "", price, stock_quantity: stock, reserved_quantity: 0, active: type.active !== false };
  });
  return { id, name: text(input.name, "Tên sự kiện", 160), venue: text(input.venue, "Địa điểm", 250), starts_at: startsAt.toISOString(), description: typeof input.description === "string" ? input.description.slice(0, 4000) : "", active: input.active !== false, ticket_types };
}

import { getDatabase, withTransaction } from "./db";
import { localEvents, validateTicketEvent, type TicketEvent, type TicketType } from "./ticket-data";

type EventRow = Omit<TicketEvent, "ticket_types">;
type TypeRow = TicketType & { kind: string };

export async function listTicketEvents(admin = false): Promise<TicketEvent[]> {
  const database = await getDatabase();
  const events = await database.query<EventRow>(`SELECT id, name, venue, starts_at, description, active FROM ticket_events ${admin ? "" : "WHERE active = TRUE"} ORDER BY starts_at, id`);
  const types = await database.query<TypeRow>(`SELECT id, event_id, name, description, price, stock_quantity, reserved_quantity, active FROM merch_products WHERE kind = 'ticket' ${admin ? "" : "AND active = TRUE"} ORDER BY price, id`);
  return events.rows.map((event) => ({ ...event, starts_at: new Date(event.starts_at).toISOString(), ticket_types: types.rows.filter((type) => type.event_id === event.id).map((type) => ({ ...type, price: Number(type.price), stock_quantity: Number(type.stock_quantity), reserved_quantity: Number(type.reserved_quantity) })) }));
}

export async function saveTicketEvent(event: TicketEvent, directus = false) {
  return withTransaction(async (client) => {
    await client.query(`INSERT INTO ticket_events (id, name, venue, starts_at, description, active) VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, venue=EXCLUDED.venue, starts_at=EXCLUDED.starts_at, description=EXCLUDED.description, active=EXCLUDED.active, updated_at=NOW()`,
    [event.id, event.name, event.venue, event.starts_at, event.description, event.active]);
    const current = await client.query<{ id: string; event_id: string | null; kind: string; reserved_quantity: number; directus_synced: boolean; stock_quantity: number }>(
      "SELECT id, event_id, kind, reserved_quantity, directus_synced, stock_quantity FROM merch_products WHERE event_id=$1 OR id=ANY($2::text[]) ORDER BY id FOR UPDATE", [event.id, event.ticket_types.map((type) => type.id)]);
    for (const type of event.ticket_types) {
      const previous = current.rows.find((item) => item.id === type.id);
      if (previous && (previous.kind !== "ticket" || previous.event_id !== event.id)) throw new Error("ID hạng vé đã được sử dụng ở danh mục khác.");
      if (!directus && previous && type.stock_quantity < previous.reserved_quantity) throw new Error("Tồn kho không được nhỏ hơn số vé đang giữ chỗ.");
      const stock = directus && previous ? previous.directus_synced ? previous.stock_quantity : Math.max(type.stock_quantity, previous.reserved_quantity) : type.stock_quantity;
      await client.query(`INSERT INTO merch_products (id,name,price,description,stock_quantity,active,kind,event_id,directus_synced)
        VALUES ($1,$2,$3,$4,$5,$6,'ticket',$7,$8) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,price=EXCLUDED.price,description=EXCLUDED.description,
        stock_quantity=EXCLUDED.stock_quantity,active=EXCLUDED.active,directus_synced=merch_products.directus_synced OR EXCLUDED.directus_synced,updated_at=NOW()`,
      [type.id, type.name, type.price, type.description, stock, type.active, event.id, directus]);
    }
    await client.query("UPDATE merch_products SET active=FALSE,updated_at=NOW() WHERE kind='ticket' AND event_id=$1 AND NOT(id=ANY($2::text[]))", [event.id, event.ticket_types.map((type) => type.id)]);
  });
}

async function importDirectusTickets() {
  const base = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!base) throw new Error("DIRECTUS_URL is required for Directus ticket mode.");
  const headers: Record<string, string> = process.env.DIRECTUS_TOKEN ? { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` } : {};
  const collections = [process.env.TICKET_DIRECTUS_EVENTS_COLLECTION || "events", process.env.TICKET_DIRECTUS_TYPES_COLLECTION || "ticket_types"];
  const rows = await Promise.all(collections.map(async (collection) => {
    const data: Record<string, unknown>[] = [];
    for (let page = 1; ; page++) {
      const response = await fetch(`${base.replace(/\/$/, "")}/items/${encodeURIComponent(collection)}?fields=*&limit=100&page=${page}`, { headers, cache: "no-store" });
      if (!response.ok) throw new Error(`Directus tickets returned HTTP ${response.status}`);
      const payload = await response.json() as { data?: Record<string, unknown>[] };
      if (!Array.isArray(payload.data)) throw new Error("Invalid Directus ticket catalog.");
      data.push(...payload.data);
      if (payload.data.length < 100) break;
    }
    return data;
  }));
  const relationId = (value: unknown) => String(value && typeof value === "object" ? (value as { id?: unknown }).id : value);
  const active = (row: Record<string, unknown>) => typeof row.active === "boolean" ? row.active : ["published", "active", "available"].includes(String(row.status).toLowerCase());
  const imported: string[] = [];
  for (const row of rows[0]) {
    const types = rows[1].filter((type) => relationId(type.event_id) === String(row.id));
    if (!types.length) continue;
    const event = validateTicketEvent({
      id: `event-${row.id}`, name: row.name, venue: row.venue ?? row.location,
      starts_at: row.starts_at ?? row.start_time, description: row.description, active: active(row),
      ticket_types: types.map((type) => ({ id: `ticket-${type.id}`, name: type.name, description: type.description, price: type.price, stock_quantity: type.quantity ?? type.stock_quantity ?? 0, active: active(type) })),
    });
    await saveTicketEvent(event, true);
    imported.push(event.id);
  }
  return imported;
}

export async function fetchTicketEvents(): Promise<TicketEvent[]> {
  const source = (process.env.TICKET_DATA_SOURCE || "postgres").toLowerCase();
  if (!["postgres", "mock", "directus"].includes(source)) throw new Error("TICKET_DATA_SOURCE must be postgres, mock, or directus.");
  if (source === "mock") return structuredClone(localEvents);
  if (source === "directus") {
    const ids = new Set(await importDirectusTickets());
    return (await listTicketEvents()).filter((event) => ids.has(event.id));
  }
  return listTicketEvents();
}

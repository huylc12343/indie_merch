"use client";

import { useState } from "react";
import { CalendarDays, Plus, Save, Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TicketEvent, TicketType } from "@/lib/ticket-data";

type Props = { events: TicketEvent[]; request: (url: string, init?: RequestInit) => Promise<unknown>; onSaved: () => Promise<void> };
const money = (value: number) => `${value.toLocaleString("vi-VN")} đ`;
const localTime = (value: string) => { const date = new Date(value); return Number.isFinite(date.getTime()) ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""; };
function Field({ label, ...props }: React.ComponentProps<typeof Input> & { label: string }) {
  return <label className="grid gap-1.5 text-xs font-semibold text-neutral-600">{label}<Input {...props} className="h-10 bg-white text-sm text-neutral-900" /></label>;
}

export default function AdminEvents({ events, request, onSaved }: Props) {
  const [draft, setDraft] = useState<TicketEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const create = () => {
    const id = crypto.randomUUID();
    setDraft({ id, name: "", venue: "", starts_at: new Date(Date.now() + 7 * 86400000).toISOString(), description: "", active: true,
      ticket_types: [{ id: `ticket-${crypto.randomUUID()}`, event_id: id, name: "Standard", price: 299000, stock_quantity: 100, reserved_quantity: 0, active: true, description: "Vé vào cửa" }] });
    setIsNew(true); setError("");
  };
  const updateType = (id: string, changes: Partial<TicketType>) => setDraft((current) => current && ({ ...current, ticket_types: current.ticket_types.map((type) => type.id === id ? { ...type, ...changes } : type) }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (!draft) return;
    setBusy(true); setError("");
    try {
      await request(isNew ? "/api/admin/events" : `/api/admin/events/${encodeURIComponent(draft.id)}`, { method: isNew ? "POST" : "PATCH", body: JSON.stringify(draft) });
      await onSaved(); setDraft(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Không lưu được sự kiện."); }
    finally { setBusy(false); }
  };
  return <section className="mt-5 space-y-5">
    <div className="flex items-center justify-between gap-4"><p className="text-sm text-neutral-600">Quản lý lịch diễn, giá vé và số chỗ còn lại.</p><Button onClick={create}><Plus className="mr-2 size-4" />Thêm sự kiện</Button></div>
    {draft && <form onSubmit={submit} className="space-y-5 rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between"><h3 className="font-bold">{isNew ? "Sự kiện mới" : "Chỉnh sửa sự kiện"}</h3><Button type="button" variant="ghost" size="icon" aria-label="Đóng chỉnh sửa" onClick={() => setDraft(null)}><X /></Button></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Tên sự kiện" value={draft.name} required maxLength={160} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <Field label="Địa điểm" value={draft.venue} required onChange={(e) => setDraft({ ...draft, venue: e.target.value })} />
        <Field label="Thời gian bắt đầu" type="datetime-local" required value={localTime(draft.starts_at)} onChange={(e) => setDraft({ ...draft, starts_at: e.target.value ? new Date(e.target.value).toISOString() : "" })} />
      </div>
      <Field label="Mô tả" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />Mở bán sự kiện</label>
      <div className="space-y-3">
        {draft.ticket_types.map((type) => <div key={type.id} className="grid gap-3 rounded-lg border bg-neutral-50 p-4 sm:grid-cols-2 xl:grid-cols-5">
          <Field label="Tên hạng vé" value={type.name} required onChange={(e) => updateType(type.id, { name: e.target.value })} />
          <Field label="Giá vé (VND)" type="number" min={0} required value={type.price} onChange={(e) => updateType(type.id, { price: Number(e.target.value) })} />
          <Field label="Tổng số lượng" type="number" min={type.reserved_quantity} required value={type.stock_quantity} onChange={(e) => updateType(type.id, { stock_quantity: Number(e.target.value) })} />
          <Field label="Mô tả hạng vé" value={type.description} onChange={(e) => updateType(type.id, { description: e.target.value })} />
          <div className="flex flex-col justify-center gap-2 text-xs"><span>Đang giữ: {type.reserved_quantity}</span><label className="flex items-center gap-2"><input type="checkbox" checked={type.active} onChange={(e) => updateType(type.id, { active: e.target.checked })} />Đang bán</label></div>
        </div>)}
        <Button type="button" variant="outline" disabled={draft.ticket_types.length >= 20} onClick={() => setDraft({ ...draft, ticket_types: [...draft.ticket_types, { id: `ticket-${crypto.randomUUID()}`, event_id: draft.id, name: "Hạng vé mới", description: "", price: 0, stock_quantity: 100, reserved_quantity: 0, active: true }] })}><Plus className="mr-2 size-4" />Thêm hạng vé</Button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={busy}><Save className="mr-2 size-4" />{busy ? "Đang lưu…" : "Lưu sự kiện và hạng vé"}</Button>
    </form>}
    {!events.length && <p className="rounded-xl bg-white p-8 text-center text-neutral-500">Chưa có sự kiện. Thêm sự kiện đầu tiên để mở bán vé.</p>}
    {events.map((event) => <article key={event.id} className="rounded-xl border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><CalendarDays className="size-5 text-pink-600" /><h3 className="text-lg font-bold">{event.name}</h3><span className="rounded-full bg-neutral-100 px-2 py-1 text-xs">{event.active ? "Đang mở bán" : "Đã ẩn"}</span></div><p className="mt-2 text-sm text-neutral-500">{new Date(event.starts_at).toLocaleString("vi-VN")} · {event.venue}</p></div><Button variant="outline" onClick={() => { setDraft(structuredClone(event)); setIsNew(false); setError(""); }}>Chỉnh sửa</Button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{event.ticket_types.map((type) => <div key={type.id} className="rounded-lg bg-neutral-50 p-4"><p className="flex items-center gap-2 font-semibold"><Ticket className="size-4" />{type.name}</p><p className="mt-2 text-lg font-bold text-pink-600">{money(type.price)}</p><p className="mt-1 text-xs text-neutral-500">Còn {type.stock_quantity - type.reserved_quantity} / {type.stock_quantity} vé · {type.active ? "Đang bán" : "Ẩn"}</p></div>)}</div>
    </article>)}
  </section>;
}

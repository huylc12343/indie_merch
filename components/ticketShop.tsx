"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Minus, Plus, Ticket } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookingStepper } from "@/components/bookingStepper/booking-stepper";
import { PaymentModal } from "@/components/paymentModal/payment-modal";
import { usePaymentRealtime } from "@/hook/use-payment-realtime";
import { checkDiscountCode, createTicketOrder, getMerchOrder, type CreateMerchOrderResponse } from "@/lib/api";
import { DEMO_MODE, getMockEvents } from "@/lib/mock-store";
import { validateEmail, validatePhone, type DiscountCodeOutput } from "@/lib/schema";
import type { TicketEvent } from "@/lib/ticket-data";

const money = (value: number) => `${value.toLocaleString("vi-VN")} đ`;
function Field({ label, ...props }: React.ComponentProps<typeof Input> & { label: string }) {
  return <label className="grid gap-2 text-sm font-medium">{label}<Input {...props} className="h-12 border-neutral-600 bg-neutral-800 text-white" /></label>;
}

export default function TicketShop({ initialEvents }: { initialEvents: TicketEvent[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [eventId, setEventId] = useState(initialEvents[0]?.id ?? "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState<DiscountCodeOutput | null>(null);
  const [order, setOrder] = useState<CreateMerchOrderResponse | null>(null);
  const [tracking, setTracking] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const event = events.find((item) => item.id === eventId);
  const subtotal = event?.ticket_types.reduce((sum, type) => sum + type.price * (quantities[type.id] ?? 0), 0) ?? 0;
  const discountAmount = discount && subtotal >= discount.min_order_value ? Math.min(subtotal, discount.type === "percentage" ? Math.ceil(subtotal * discount.value / 100) : discount.value) : 0;
  const count = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);

  useEffect(() => {
    const refresh = () => {
      if (!DEMO_MODE) return;
      const next = getMockEvents(); setEvents(next);
      setEventId((current) => next.some((event) => event.id === current) ? current : next[0]?.id ?? "");
    };
    refresh();
    const requested = new URLSearchParams(window.location.search).get("event");
    if (requested) setEventId(requested);
    window.addEventListener("storage", refresh); window.addEventListener("focus", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("focus", refresh); };
  }, []);

  usePaymentRealtime({ enabled: tracking, orderId: order?.id, getOrder: getMerchOrder, pollingInterval: 1000,
    onSuccess: (updated) => { setOrder(updated); setTracking(false); setPaymentOpen(false); if (DEMO_MODE) setEvents(getMockEvents()); },
    onExpired: () => { setTracking(false); setPaymentOpen(false); setOrder(null); setError("Đơn vé đã hủy hoặc hết hạn. Vui lòng đặt lại."); },
  });
  const applyCode = async () => {
    setError(""); setBusy(true);
    try { const found = await checkDiscountCode(code); if (!found || subtotal < found.min_order_value) throw new Error("Mã không hợp lệ hoặc đơn chưa đạt giá trị tối thiểu."); setDiscount(found); }
    catch (caught) { setDiscount(null); setError(caught instanceof Error ? caught.message : "Không kiểm tra được mã."); }
    finally { setBusy(false); }
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!event || !count) { setError("Vui lòng chọn ít nhất một vé."); return; }
    if (!validatePhone(customer.phone.trim()).success || !validateEmail(customer.email.trim()).success) { setError("Số điện thoại hoặc email không hợp lệ."); return; }
    setBusy(true);
    try {
      const created = await createTicketOrder({ event_id: event.id, customer_name: customer.name.trim(), customer_phone: customer.phone.trim(), customer_email: customer.email.trim(), discount_code: discount?.code,
        items: event.ticket_types.filter((type) => quantities[type.id] > 0).map((type) => ({ ticket_type_id: type.id, quantity: quantities[type.id] })),
      });
      setOrder(created); setTracking(true); setPaymentOpen(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Không đặt được vé."); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white md:px-8 md:py-16">
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-500">In-đỉ In-đi · Live music</p><h1 className="mt-3 font-retroguard text-5xl md:text-7xl">ĐẶT VÉ ĐÊM NHẠC</h1><p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400">Chọn sự kiện và hạng vé. Vé điện tử sẽ xuất hiện sau khi thanh toán được xác nhận.</p></div><Link href="/" className="text-sm font-semibold text-pink-400 underline">Khám phá merch</Link></div>
      <div className="mb-10"><BookingStepper currentStep={order?.status === "done" ? 3 : order ? 2 : 1} steps={["Chọn vé", "Thanh toán", "Nhận vé"]} /></div>
      {DEMO_MODE && <p className="mb-6 rounded-lg border border-pink-500/30 bg-pink-500/10 p-4 text-sm text-pink-200">Bản demo · QR xuất hiện sau 3 giây và tự thanh toán sau 3 giây tiếp theo.</p>}
      {order?.status === "done" ? <section className="rounded-2xl border border-green-500/30 bg-neutral-900 p-6 md:p-10">
        <p className="text-sm font-bold text-green-400">THANH TOÁN THÀNH CÔNG</p><h2 className="mt-3 font-retroguard text-3xl">VÉ CỦA BẠN ĐÃ SẴN SÀNG</h2><p className="mt-3 text-sm text-neutral-400">Đơn {order.order_code} · {money(order.total ?? 0)}{DEMO_MODE ? " · Vé thử nghiệm, không dùng để vào cửa." : " · Giữ mã vé để xuất trình tại sự kiện."}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{order.ticket_codes?.map((code) => <article key={code} className="rounded-xl bg-white p-5 text-center text-neutral-900"><QRCodeSVG value={`indi-ticket://ticket/${code}`} size={150} className="mx-auto" /><p className="mt-4 text-sm font-bold">{event?.name}</p><p className="mt-2 break-all font-mono text-xs">{code}</p></article>)}</div>
        <div className="mt-7 flex flex-wrap gap-3"><Button onClick={() => { setOrder(null); setQuantities({}); setDiscount(null); setCode(""); }}>Đặt thêm vé</Button><Link href="/admin?section=ticket-orders" className="rounded-lg border border-neutral-600 px-4 py-2 text-sm">Xem đơn trong admin</Link></div>
      </section> : <form onSubmit={submit} className="grid items-start gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">{events.map((item) => <button key={item.id} type="button" disabled={!!order} onClick={() => { setEventId(item.id); setQuantities({}); setDiscount(null); setError(""); }} className={`rounded-xl border p-5 text-left ${eventId === item.id ? "border-pink-500 bg-pink-500/10" : "border-neutral-700 bg-neutral-900"}`}><Ticket className="mb-3 size-6 text-pink-400" /><span className="block text-lg font-bold">{item.name}</span><span className="mt-3 flex items-center gap-2 text-xs text-neutral-400"><CalendarDays className="size-4" />{new Date(item.starts_at).toLocaleString("vi-VN")}</span><span className="mt-2 flex items-center gap-2 text-xs text-neutral-400"><MapPin className="size-4" />{item.venue}</span></button>)}</div>
          {!events.length && <p className="rounded-xl border border-neutral-700 p-8">Chưa có sự kiện mở bán.</p>}
          {event && <section className="space-y-4 rounded-xl border border-neutral-700 bg-neutral-900 p-5"><h2 className="text-xl font-bold">Chọn hạng vé</h2><p className="text-sm leading-6 text-neutral-400">{event.description}</p>{event.ticket_types.map((type) => {
            const available = Math.max(0, type.stock_quantity - type.reserved_quantity), quantity = quantities[type.id] ?? 0;
            return <div key={type.id} className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-700 py-4"><div><h3 className="font-bold">{type.name}</h3><p className="mt-1 text-xs text-neutral-400">{type.description}</p><p className="mt-2 font-bold text-pink-400">{money(type.price)} <span className="ml-2 text-xs font-normal text-neutral-500">{available > 0 ? `Còn ${available} vé` : "Hết vé"}</span></p></div><div className="flex items-center gap-3"><Button type="button" variant="outline" size="icon" className="border-neutral-600 bg-neutral-800 text-white hover:bg-neutral-700" aria-label={`Bớt ${type.name}`} disabled={!!order || quantity <= 0} onClick={() => setQuantities({ ...quantities, [type.id]: quantity - 1 })}><Minus /></Button><output className="w-6 text-center" aria-label={`Số lượng ${type.name}`}>{quantity}</output><Button type="button" variant="outline" size="icon" className="border-neutral-600 bg-neutral-800 text-white hover:bg-neutral-700" aria-label={`Thêm ${type.name}`} disabled={!!order || quantity >= Math.min(40, available)} onClick={() => setQuantities({ ...quantities, [type.id]: quantity + 1 })}><Plus /></Button></div></div>;
          })}</section>}
          <section className="space-y-4 rounded-xl border border-neutral-700 bg-neutral-900 p-5"><h2 className="text-xl font-bold">Thông tin người mua</h2><Field label="Họ và tên" required disabled={!!order} autoComplete="name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Số điện thoại" type="tel" required disabled={!!order} autoComplete="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /><Field label="Email" type="email" required disabled={!!order} autoComplete="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} /></div></section>
        </div>
        <aside className="space-y-5 rounded-xl border border-neutral-700 bg-neutral-900 p-6 lg:sticky lg:top-32"><h2 className="text-xl font-bold">Đơn vé của bạn</h2><p className="text-sm text-neutral-400">{event?.name ?? "Chọn sự kiện"}</p>{event?.ticket_types.filter((type) => quantities[type.id] > 0).map((type) => <p key={type.id} className="flex justify-between gap-4 text-sm"><span>{type.name} × {quantities[type.id]}</span><span>{money(type.price * quantities[type.id])}</span></p>)}
          <div className="flex gap-2"><Input aria-label="Mã giảm giá" placeholder="Mã giảm giá" disabled={!!order} value={code} onChange={(e) => { setCode(e.target.value); setDiscount(null); }} className="h-10 border-neutral-600 text-white" /><Button type="button" variant="outline" className="border-neutral-600 bg-neutral-800 text-white hover:bg-neutral-700" disabled={busy || !!order || !code.trim()} onClick={() => void applyCode()}>Áp dụng</Button></div>{discount && <p className="text-xs text-green-400">Đã áp dụng {discount.code}</p>}
          <div className="space-y-3 border-t border-neutral-700 pt-4 text-sm"><p className="flex justify-between"><span>Tạm tính</span><span>{money(subtotal)}</span></p><p className="flex justify-between"><span>Giảm giá</span><span>−{money(discountAmount)}</span></p><p className="flex justify-between text-lg font-bold"><span>Tổng tiền</span><span className="text-pink-400">{money(order?.total ?? subtotal - discountAmount)}</span></p></div>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          {order ? <Button type="button" className="h-12 w-full bg-pink-600 text-white" onClick={() => setPaymentOpen(true)}>Mở mã QR thanh toán</Button> : <Button type="submit" disabled={busy || !count || !event} className="h-12 w-full bg-pink-600 font-bold text-white hover:bg-pink-700">{busy ? "Đang tạo đơn…" : "Đặt vé và thanh toán"}</Button>}
          <p className="text-xs leading-5 text-neutral-500">Giữ chỗ trong 15 phút. Mỗi vé được cấp một mã riêng sau khi thanh toán.</p>
        </aside>
      </form>}
      <PaymentModal open={paymentOpen} order={order} bankName={order?.payment_info.bin ?? null} onClose={() => setPaymentOpen(false)} />
    </div>
  </main>;
}

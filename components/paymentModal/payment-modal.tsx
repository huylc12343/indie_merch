"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import type { CreateMerchOrderResponse } from "@/lib/api";

type PaymentModalProps = {
  open: boolean;
  order: CreateMerchOrderResponse | null;
  bankName: string | null;
  onClose: () => void;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function PaymentModal({ open, order, bankName, onClose }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "transfer">("qr");
  const [qrVisible, setQrVisible] = useState(false);
  const [isAutoPaying, setIsAutoPaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!order?.id) return;
    setQrVisible(false);
    setIsAutoPaying(false);
    setActiveTab("qr");

    let paymentTimer: number | undefined;
    const qrTimer = window.setTimeout(() => {
      setQrVisible(true);
      paymentTimer = window.setTimeout(async () => {
        setIsAutoPaying(true);
        try {
          const response = await fetch(`/api/orders/${order.id}/simulate-payment`, { method: "POST" });
          if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(payload?.error || "Không thể hoàn tất thanh toán mô phỏng.");
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Thanh toán mô phỏng thất bại.");
          setIsAutoPaying(false);
        }
      }, 3000);
    }, 3000);

    return () => {
      window.clearTimeout(qrTimer);
      if (paymentTimer !== undefined) window.clearTimeout(paymentTimer);
    };
  }, [order?.id]);

  useEffect(() => {
    if (!open || !order?.expires_at) return;
    const expiresAt = new Date(order.expires_at).getTime();
    const update = () => setTimeLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [open, order?.expires_at]);

  if (!open || !order) return null;

  const fields = [
    { label: "Mã đơn", value: order.id },
    { label: "Ngân hàng mô phỏng", value: bankName ?? order.payment_info.bin },
    { label: "Tài khoản mô phỏng", value: order.payment_info.account_number },
    { label: "Số tiền", value: `${formatMoney(order.payment_info.amount)} đ` },
    { label: "Nội dung", value: order.payment_info.description },
  ];

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Đã sao chép.");
    } catch {
      toast.error("Không thể sao chép thông tin.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="w-full max-w-[760px] rounded-xl bg-white p-5 text-black shadow-2xl md:p-8" role="dialog" aria-modal="true" aria-labelledby="payment-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF017E]">Đơn {order.order_code ?? order.id.slice(0, 8)}</p>
            <h2 id="payment-title" className="mt-1 font-retroguard text-3xl text-[#171717]">THANH TOÁN</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Đóng cửa sổ thanh toán"><X /></Button>
        </div>

        <div className="mt-6 flex gap-2 rounded-lg bg-[#F3F3F3] p-1">
          <button type="button" onClick={() => setActiveTab("qr")} className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${activeTab === "qr" ? "bg-[#FF017E] text-white" : "text-[#555]"}`}>Mã QR</button>
          <button type="button" onClick={() => setActiveTab("transfer")} className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${activeTab === "transfer" ? "bg-[#FF017E] text-white" : "text-[#555]"}`}>Thông tin demo</button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
          <div className="flex flex-col items-center rounded-lg bg-[#F5F5F5] p-5">
            <div className="flex size-[210px] items-center justify-center rounded-lg bg-white p-3">
              {qrVisible ? (
                <QRCodeSVG value={order.payment_info.qr_code} size={184} level="M" includeMargin />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center text-sm text-[#6C6C6C]">
                  <Loader2 className="size-7 animate-spin text-[#FF017E]" />
                  <span>Mã QR sẽ hiện sau 3 giây</span>
                </div>
              )}
            </div>
            <p className="mt-4 w-full text-center text-xs font-semibold uppercase tracking-wide text-[#FF017E]">Mô phỏng thanh toán · không chuyển tiền thật</p>
            <div className="mt-4 flex w-full items-center justify-between text-sm">
              <span>Tổng tiền</span><strong>{formatMoney(order.payment_info.amount)} đ</strong>
            </div>
            <div className="mt-3 flex w-full items-center justify-between border-t border-[#DDD] pt-3 text-sm">
              <span className="text-[#6C6C6C]">Hết hạn sau</span><strong>{timeLeft > 0 ? formatTime(timeLeft) : "Đã hết hạn"}</strong>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {activeTab === "qr" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Thanh toán thử nghiệm</h3>
                <ol className="space-y-3 text-sm leading-6 text-[#444]">
                  <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FF017E] font-semibold text-white">1</span><span>Quét QR demo hoặc xem thông tin đơn hàng.</span></li>
                  <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FF017E] font-semibold text-white">2</span><span>QR hiện sau 3 giây. Hệ thống tự xác nhận thành công sau 3 giây tiếp theo.</span></li>
                  <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FF017E] font-semibold text-white">3</span><span>Trang sẽ tự chuyển sang xác nhận đơn khi trạng thái PostgreSQL được cập nhật.</span></li>
                </ol>
                {isAutoPaying && <p className="flex items-center gap-2 rounded-lg bg-pink-50 p-3 text-sm font-medium text-[#C90062]"><Loader2 className="size-4 animate-spin" />Đang hoàn tất thanh toán mô phỏng…</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Chi tiết dùng trong bản demo</h3>
                {fields.map((field) => (
                  <div key={field.label} className="flex items-center justify-between gap-3 border-b border-[#EEE] pb-3">
                    <div className="min-w-0"><p className="text-xs text-[#777]">{field.label}</p><p className="break-all text-sm font-medium">{field.value}</p></div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => void copy(field.value)} aria-label={`Sao chép ${field.label}`}><Copy className="size-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

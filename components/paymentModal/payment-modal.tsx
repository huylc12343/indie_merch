"use client";

import { useEffect, useState } from "react";
import { CopyIcon, Loader2, XIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { PAYMENT_STATUS_TEXT } from "@/lib/types";
import { Button } from "@/components/ui/button";

import type { CreateMerchOrderResponse } from "@/lib/api";
import { getMerchOrder, confirmPayment } from "@/lib/api";

import { ORDER_STATUS } from "@/lib/types";
import { cn } from "@/lib/utils";

type PaymentModalProps = {
  open: boolean;
  order: CreateMerchOrderResponse | null;
  bankName: string | null;
  onClose: () => void;
};

type PaymentTab = "qr" | "transfer";

function PaymentTabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "h-auto flex-1 rounded-[8px] px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[#FF017E] text-white shadow-[0px_1px_3px_rgba(0,0,0,0.10)] hover:bg-[#FF017E]"
          : "bg-transparent text-black hover:bg-white",
      )}
    >
      {children}
    </Button>
  );
}

function PaymentStep({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FF017E] text-base font-semibold text-white">
        {number}
      </div>

      <div className="text-sm leading-4 text-black">{children}</div>
    </div>
  );
}

function CopyField({
  label,
  displayValue,
  copyValue,
}: {
  label: string;
  displayValue: string;
  copyValue: string;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);

      toast.success("Đã sao chép thông tin.", {
        position: "top-center",
      });
    } catch {
      toast.error("Không thể sao chép thông tin.", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-2">
        <p className="text-xs leading-4 text-[#6C6C6C]">{label}</p>

        <p className="break-all text-sm leading-6 text-black">{displayValue}</p>
      </div>

      <Button
        type="button"
        onClick={handleCopy}
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 rounded-[8px] text-[#FF017E] hover:bg-white"
      >
        <CopyIcon className="size-4" />
      </Button>
    </div>
  );
}

export function PaymentModal({
  open,
  order,
  bankName,
  onClose,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>("qr");

  const [isQrLoading, setIsQrLoading] = useState(true);

  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const handleConfirmPayment = async () => {
    if (!order?.id) return;

    try {
      setIsConfirming(true);
      console.log(
        "Xác nhận thanh toán cho đơn hàng:",
        order.id,
        order.payment_info.description,
        order.payment_info.amount,
        order.payment_info.bin,
        order.payment_info.account_name,
        order.payment_info.account_number,
        order.payment_info.qr_code,
      );
      await confirmPayment(
        order.id,
        order.payment_info.description, // chính là nội dung chuyển khoản
      );

      toast.success("Đã xác nhận thanh toán, vui lòng chờ...");
    } catch (error) {
      toast.error("Xác nhận thất bại, kiểm tra lại nội dung CK");
    } finally {
      setIsConfirming(false);
    }
  };
  /*
    POLLING MỖI 3 GIÂY
  */
  // payment-modal.tsx
  useEffect(() => {
    if (!order?.expires_at) return;

    setIsExpired(false);
    setTimeLeft(0);

    // 🔥 FIX timezone
    const expireTime = new Date(order.expires_at).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime(); // vẫn OK

      const diff = Math.max(0, Math.floor((expireTime - now) / 1000));

      setTimeLeft(diff);

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.expires_at]);

  useEffect(() => {
    if (!isExpired || !order?.id) return;

    const handleExpire = async () => {
      try {
        const latest = await getMerchOrder(order.id);
        setPaymentStatus(latest.status);
      } catch (err) {
        console.error(err);
      }

      // ⏳ hiển thị trạng thái 3s rồi đóng
      setTimeout(() => {
        onClose();
      }, 3000);
    };

    handleExpire();
  }, [isExpired, order?.id]);
  if (!open || !order) {
    return null;
  }
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  const transferFields = [
    {
      label: "Tên ngân hàng",
      displayValue: bankName ?? order.payment_info.bin,
      copyValue: bankName ?? order.payment_info.bin,
    },
    {
      label: "Tên tài khoản",
      displayValue: order.payment_info.account_name,
      copyValue: order.payment_info.account_name,
    },
    {
      label: "Số tài khoản",
      displayValue: order.payment_info.account_number,
      copyValue: order.payment_info.account_number,
    },
    {
      label: "Số tiền",
      displayValue: new Intl.NumberFormat("vi-VN").format(
        order.payment_info.amount,
      ),
      copyValue: order.payment_info?.amount?.toString() ?? "",
    },
    {
      label: "Nội dung chuyển khoản",
      displayValue: order.payment_info.description,
      copyValue: order.payment_info.description,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      onClick={onClose}
    >
      <div
        className="inline-flex w-full max-w-[800px] flex-col items-center gap-6 rounded-[12px] bg-white p-4 lg:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between gap-4">
          <div>
            <p className="font-heading text-[32px] leading-12 text-[#FF017E]">
              THANH TOÁN
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {/* STATUS */}
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-[#FF017E]" />
                <p className="text-sm text-[#6C6C6C]">
                  Trạng thái:{" "}
                  {PAYMENT_STATUS_TEXT[paymentStatus] ?? paymentStatus}
                </p>
              </div>

              {/* COUNTDOWN */}
            </div>
          </div>

          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="size-8 rounded-[8px] text-black hover:bg-[#F5F5F5]"
          >
            <XIcon className="size-5" />
          </Button>
        </div>

        <div className="flex w-full items-center gap-2 rounded-[10px] bg-[#F5F5F5] px-2 py-1">
          <PaymentTabButton
            active={activeTab === "qr"}
            onClick={() => setActiveTab("qr")}
          >
            Mã QR
          </PaymentTabButton>

          <PaymentTabButton
            active={activeTab === "transfer"}
            onClick={() => setActiveTab("transfer")}
          >
            Chuyển khoản
          </PaymentTabButton>
        </div>

        <div className="w-full">
          {activeTab === "qr" ? (
            <div className="flex w-full flex-col gap-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="flex w-full flex-col gap-5 rounded-[10px] bg-[#F5F5F5] p-5">
                <div className="flex items-center justify-center rounded-[10px] bg-white p-3">
                  <div className="relative h-[184px] w-[184px] overflow-hidden rounded-[10px] bg-white">
                    {isQrLoading && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                        <Loader2 className="size-8 animate-spin text-[#FF017E]" />
                      </div>
                    )}
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(order.payment_info.qr_code)}`}
                      alt="QR thanh toán"
                      fill
                      unoptimized
                      onLoad={() => setIsQrLoading(false)}
                      onError={() => setIsQrLoading(false)}
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm leading-6 text-black">
                  <p>Tổng tiền</p>

                  <p>
                    {new Intl.NumberFormat("vi-VN").format(
                      order.payment_info.amount,
                    )}{" "}
                    đ
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-[8px] bg-[#F5F5F5] px-3 py-2">
                  <p className="text-xs text-[#6C6C6C]">Thời gian còn lại</p>

                  <p
                    className={cn(
                      "text-base font-semibold",
                      timeLeft <= 60 ? "text-red-500" : "text-[#FF017E]",
                    )}
                  >
                    {isExpired ? "Hết hạn" : formatTime(timeLeft)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <PaymentStep number={1}>
                  Mở app ngân hàng hoặc ví điện tử
                </PaymentStep>

                <PaymentStep number={2}>Quét mã QR</PaymentStep>

                <PaymentStep number={3}>
                  Hoàn tất thanh toán và chờ xác nhận tự động
                </PaymentStep>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="rounded-[10px] bg-[#F5F5F5] p-5">
                <div className="space-y-5">
                  {transferFields.map((field) => (
                    <CopyField
                      key={field.label}
                      label={field.label}
                      displayValue={field.displayValue}
                      copyValue={field.copyValue}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <PaymentStep number={1}>Mở app ngân hàng</PaymentStep>

                <PaymentStep number={2}>
                  Sao chép đúng thông tin chuyển khoản
                </PaymentStep>

                <PaymentStep number={3}>
                  Hệ thống sẽ tự xác nhận sau khi thanh toán
                </PaymentStep>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

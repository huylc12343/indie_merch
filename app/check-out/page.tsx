"use client";

import { BookingStepper } from "@/components/bookingStepper/booking-stepper";
import { useEffect, useState, useMemo, useCallback } from "react";
import MerchBookingForm from "@/components/merchBookingForm/MerchBookingForm";
import { BookingPaymentInfo } from "@/components/bookingPaymentInfo/booking-payment-info";
import MerchBookingAside from "@/components/merchBookingAside/merch-booking-aside";
import { BookingSuccessInfo } from "@/components/bookingSuccessInfo/booking-success-info";
import { CartItem } from "@/lib/types";
import { useMerchOrderActions } from "@/hook/use-booking-order-actions";
import { toast } from "sonner";
import { PaymentModal } from "@/components/paymentModal/payment-modal";
import { usePaymentRealtime } from "@/hook/use-payment-realtime";
import { getMerchOrder } from "@/lib/api";
import { useShippingFee } from "@/hook/use-shipping-fee";

type OrderSnapshot = {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
};

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderSnapshot, setOrderSnapshot] = useState<OrderSnapshot | null>(
    null,
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "delivery">(
    "pickup",
  );

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { shippingFee, isCalculating, calculateFee } = useShippingFee();

  // ================= LOAD CART =================
  useEffect(() => {
    const loadCart = () => {
      try {
        const data = localStorage.getItem("cart");
        if (!data) return setCartItems([]);

        const parsed = JSON.parse(data);
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCartItems([]);
      }
    };

    loadCart();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart") loadCart();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ================= SUBTOTAL =================
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  // ================= SHIPPING =================
  const resolvedShippingFee = shippingMethod === "pickup" ? 0 : shippingFee;

  useEffect(() => {
    if (shippingMethod !== "delivery") return;
    if (!address || address.length < 15) return;

    calculateFee(address, subtotal);
  }, [address, subtotal, shippingMethod, calculateFee]);

  const handleShippingMethodChange = useCallback(
    (value: "pickup" | "delivery") => {
      setShippingMethod(value);

      if (value === "pickup") {
        calculateFee("", 0);
      } else if (address) {
        calculateFee(address, subtotal);
      }
    },
    [address, subtotal, calculateFee],
  );

  const handleAddressChange = useCallback(
    (value: string) => {
      setAddress(value);
      if (shippingMethod === "delivery") {
        calculateFee(value, subtotal);
      }
    },
    [shippingMethod, subtotal, calculateFee],
  );

  const showErrorToast = useCallback((msg: string) => {
    toast.error(msg);
  }, []);

  // ================= ORDER ACTION =================
  const {
    appliedDiscount,
    createdOrder,
    handleApplyDiscount,
    handleClearDiscount,
    handleCreateOrder,
    updateCreatedOrder,
    isApplyingDiscount,
    computedTotal,
    resolvedDiscountCodeAmount,
    paymentBankName,
    validateForm,
    errors,
  } = useMerchOrderActions({
    cartItems,
    discountCode,
    fullName,
    phone,
    email,
    address: shippingMethod === "delivery" ? address : "Bụi dốc",
    shippingFee: resolvedShippingFee,
    subtotal,
    showErrorToast,
    onOrderCreated: () => {
      // 🔥 snapshot FULL order
      setOrderSnapshot({
        items: cartItems,
        subtotal,
        shippingFee: resolvedShippingFee,
        discount: resolvedDiscountCodeAmount,
        total: computedTotal,
      });

      setIsPollingEnabled(true);
      setIsPaymentModalOpen(true);
      setCurrentStep(2);
    },
  });

  // ================= POLLING =================
  usePaymentRealtime({
    enabled: !!createdOrder?.id && isPollingEnabled,
    orderId: createdOrder?.id,
    getOrder: getMerchOrder,

    onSuccess: (order) => {
      updateCreatedOrder?.(order);

      setIsPollingEnabled(false);

      localStorage.removeItem("cart");
      setCartItems([]);

      setCurrentStep(3);
      setIsPaymentModalOpen(false);
    },

    onExpired: () => {
      setIsPollingEnabled(false);
      setIsPaymentModalOpen(false);
      toast.error("Đơn hàng đã hết hạn hoặc bị huỷ");
    },

    pollingInterval: 5000,
  });

  // ================= ASIDE DATA =================
  const asideData =
    currentStep === 3 && orderSnapshot
      ? orderSnapshot
      : {
          items: cartItems,
          subtotal,
          shippingFee: resolvedShippingFee,
          discount: resolvedDiscountCodeAmount,
          total: computedTotal,
        };

  const handleEditPaymentInfo = () => setCurrentStep(1);

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#2F2F2F]">
      <section className="bg-[#171717] px-30 pt-[77px] pb-[140px]">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <p className="font-retroguard text-[60px] text-white">THANH TOÁN</p>

          <BookingStepper
            currentStep={currentStep}
            steps={["Thông tin chung", "Thanh toán", "Xác nhận đơn hàng"]}
          />
        </div>
      </section>

      <section className="px-30">
        <div className="relative z-10 -mt-[80px] flex gap-5">
          {currentStep === 1 ? (
            <MerchBookingForm
              shippingMethod={shippingMethod}
              resolvedDiscountCodeAmount={resolvedDiscountCodeAmount}
              onShippingMethodChange={handleShippingMethodChange}
              fullName={fullName}
              phone={phone}
              email={email}
              address={address}
              discountCode={discountCode}
              appliedDiscount={appliedDiscount}
              isApplyingDiscount={isApplyingDiscount}
              setFullName={setFullName}
              setPhone={setPhone}
              setEmail={setEmail}
              setAddress={handleAddressChange}
              isCalculatingShipping={isCalculating}
              setDiscountCode={setDiscountCode}
              onApplyDiscount={handleApplyDiscount}
              onClearDiscount={handleClearDiscount}
              errors={errors}
            />
          ) : currentStep === 2 ? (
            <BookingPaymentInfo
              fullName={fullName}
              phone={phone}
              email={email}
              address={shippingMethod === "delivery" ? address : "Bụi dốc"}
              onEdit={handleEditPaymentInfo}
            />
          ) : (
            <BookingSuccessInfo email={email} />
          )}

          <MerchBookingAside
            cartItems={asideData.items}
            subtotal={asideData.subtotal}
            discountCodeAmount={asideData.discount}
            shippingFee={asideData.shippingFee}
            total={asideData.total}
            totalLabel={currentStep === 1 ? "Tạm tính" : "Tổng tiền"}
            actionLabel={currentStep === 1 ? "Tiếp tục" : "Thanh toán"}
            showActionButton={currentStep !== 3}
            showPolicyNote={currentStep === 2}
            onActionClick={
              currentStep === 1
                ? () => {
                    if (!validateForm()) return; // 🔥 chặn nếu sai
                    setCurrentStep(2);
                  }
                : currentStep === 2
                  ? handleCreateOrder
                  : undefined
            }
          />
        </div>
      </section>

      <PaymentModal
        open={isPaymentModalOpen}
        order={createdOrder}
        bankName={paymentBankName}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}

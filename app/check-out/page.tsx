"use client";

import { BookingStepper } from "@/components/bookingStepper/booking-stepper";
import { useEffect, useState, useMemo, useCallback } from "react";
// import { PaymentModal } from "@/components/paymentModal/payment-modal";
import MerchBookingForm from "@/components/merchBookingForm/MerchBookingForm";
import { BookingPaymentInfo } from "@/components/bookingPaymentInfo/booking-payment-info";
import MerchBookingAside from "@/components/merchBookingAside/merch-booking-aside";
import { BookingSuccessInfo } from "@/components/bookingSuccessInfo/booking-success-info";
import { CartItem } from "@/lib/types";
import { useMerchOrderActions } from "@/hook/use-booking-order-actions"; // ← hook mới
// import { toast } from "sonner"; // hoặc bất kỳ toast lib nào bạn đang dùng

const SHIPPING_FEES: Record<"pickup" | "delivery", number> = {
  pickup: 0,
  delivery: 30000,
};

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  useEffect(() => {
    const data = localStorage.getItem("cart");
    if (data) setCartItems(JSON.parse(data));
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems],
  );

  const shippingFee = SHIPPING_FEES[shippingMethod];

  const showErrorToast = useCallback((message: string) => {
    // toast.error(message);
  }, []);

  const handleOrderCreated = useCallback(() => {
    setIsPaymentModalOpen(true);
  }, []);

  const {
    appliedDiscount,
    handleApplyDiscount,
    handleClearDiscount,
    handleCreateOrder,
    isApplyingDiscount,
    isSubmittingOrder,
    computedTotal,
    resolvedDiscountCodeAmount,

    // createdOrder,
    paymentBankName,
  } = useMerchOrderActions({
    cartItems,
    discountCode,
    fullName,
    phone,
    email,
    address: shippingMethod === "delivery" ? address : "Bụi dốc",
    shippingFee,
    subtotal,
    showErrorToast,
    onOrderCreated: handleOrderCreated,
  });

  const handleEditPaymentInfo = () => setCurrentStep(1);

  return (
    <div className="min-h-screen bg-[#2F2F2F]">
      <section className="bg-[#171717] px-30 pt-[77px] pb-[140px]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <p className="font-retroguard text-[60px] leading-none uppercase text-white">
            THANH TOÁN
          </p>
          <BookingStepper
            currentStep={currentStep}
            steps={["Thông tin chung", "Thanh toán", "Xác nhận đơn hàng"]}
          />
        </div>
      </section>

      <section className="px-30">
        <div className="relative z-10 -mt-[80px]">
          <div className="flex flex-1 flex-row gap-5">
            {currentStep === 1 ? (
              <MerchBookingForm
                shippingMethod={shippingMethod}
                onShippingMethodChange={setShippingMethod}
                fullName={fullName}
                phone={phone}
                email={email}
                address={address}
                discountCode={discountCode}
                appliedDiscount={appliedDiscount} // ← thêm
                isApplyingDiscount={isApplyingDiscount} // ← thêm
                setFullName={setFullName}
                setPhone={setPhone}
                setEmail={setEmail}
                setAddress={setAddress}
                setDiscountCode={setDiscountCode}
                onApplyDiscount={handleApplyDiscount} // ← thêm
                onClearDiscount={handleClearDiscount} // ← thêm
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
              <BookingSuccessInfo email={email} /> // ← dùng email thật
            )}

            <MerchBookingAside
              cartItems={cartItems}
              subtotal={subtotal}
              discountCodeAmount={resolvedDiscountCodeAmount}
              shippingFee={shippingFee}
              total={computedTotal} // ← dùng computedTotal đã trừ discount
              totalLabel={currentStep === 1 ? "Tạm tính" : "Tổng tiền"}
              actionLabel={currentStep === 1 ? "Tiếp tục" : "Thanh toán"}
              showActionButton={currentStep !== 3}
              showPolicyNote={currentStep === 2}
              // isLoading={isSubmittingOrder}             // ← thêm nếu aside hỗ trợ
              onActionClick={
                currentStep === 1
                  ? () => setCurrentStep(2)
                  : currentStep === 2
                    ? handleCreateOrder // ← gọi thật thay vì setCurrentStep(3)
                    : undefined
              }
            />
          </div>
        </div>
      </section>
      {/* <PaymentModal
        // key={`${createdOrder?.id ?? "empty"}-${isPaymentModalOpen ? "open" : "closed"}`}
        open={isPaymentModalOpen}
        // order={createdOrder}
        bankName={paymentBankName}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setCurrentStep(3);
        }}
      /> */}
    </div>
  );
}

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
  const [checkoutSource, setCheckoutSource] = useState<"cart" | "buynow">(
    "cart",
  );
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [shippingMethod, setShippingMethod] = useState<
    "pickup_store" | "pickup_event" | "delivery"
  >("pickup_store");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { shippingFee, isCalculating, calculateFee, shippingError } =
    useShippingFee();

  // ================= LOAD CART =================
  useEffect(() => {
    const loadCart = () => {
      try {
        // 🔥 1. Ưu tiên checkout_items (từ giỏ hàng)
        const checkoutItems = localStorage.getItem("checkout_items");

        if (checkoutItems) {
          const parsed = JSON.parse(checkoutItems);
          setCartItems(Array.isArray(parsed) ? parsed : []);
          setCheckoutSource("cart");

          localStorage.removeItem("checkout_items"); // dùng 1 lần
          return;
        }

        // 🔥 2. Sau đó mới tới buynow
        const buyNowData = localStorage.getItem("buynow");

        if (buyNowData) {
          const parsed = JSON.parse(buyNowData);
          setCartItems(Array.isArray(parsed) ? parsed : []);
          setCheckoutSource("buynow");

          localStorage.removeItem("buynow"); // 🔥 QUAN TRỌNG
          return;
        }

        // 🔥 3. fallback cart
        const cartData = localStorage.getItem("cart");

        if (cartData) {
          const parsed = JSON.parse(cartData);
          setCartItems(Array.isArray(parsed) ? parsed : []);
          setCheckoutSource("cart");
          return;
        }

        setCartItems([]);
      } catch {
        setCartItems([]);
      }
    };

    loadCart();

    const handleStorageChange = (e: StorageEvent) => {
      if (checkoutSource === "cart" && e.key === "cart") {
        loadCart();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ================= SUBTOTAL =================
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  // ================= SHIPPING =================
  const resolvedShippingFee = shippingMethod === "delivery" ? shippingFee : 0;

  const handleShippingMethodChange = useCallback(
    (value: "pickup_store" | "pickup_event" | "delivery") => {
      setShippingMethod(value);
      if (value !== "delivery") {
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
  const resolvedAddress = useMemo(() => {
    if (shippingMethod === "pickup_store")
      return "BỤI ROCK - E5, đường P. Đặng Văn Ngữ, Kim Liên, Hà Nội 120638, Việt Nam";
    if (shippingMethod === "pickup_event")
      return "Cổng Nối - số 2 Trịnh Công Sơn, Tây Hồ, Hà Nội";
    return address; // delivery → địa chỉ khách nhập
  }, [shippingMethod, address]);
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
    discountError,
  } = useMerchOrderActions({
    cartItems,
    discountCode,
    fullName,
    phone,
    email,
    address: resolvedAddress,
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

      if (checkoutSource === "buynow") {
        localStorage.removeItem("buynow");
      } else {
        localStorage.removeItem("cart");
      }
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
    <div className="min-h-screen bg-[#2F2F2F] pb-20">
      <section className="bg-[#171717] px-4 md:px-30 pt-10 md:pt-[77px] pb-16 md:pb-[140px]">
        <div className="flex flex-col gap-6 md:gap-10 lg:flex-row lg:justify-between">
          <p className="font-retroguard text-[32px] md:text-[60px] text-white text-center">
            THANH TOÁN
          </p>

          <BookingStepper
            currentStep={currentStep}
            steps={["Thông tin chung", "Thanh toán", "Xác nhận đơn hàng"]}
          />
        </div>
      </section>

      <section className="px-4 md:px-30 ">
        <div className="relative z-10 -mt-10 md:-mt-[80px] flex flex-col lg:flex-row gap-5">
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
              shippingError={shippingError}
              setEmail={setEmail}
              setAddress={handleAddressChange}
              isCalculatingShipping={isCalculating}
              setDiscountCode={setDiscountCode}
              onApplyDiscount={handleApplyDiscount}
              onClearDiscount={handleClearDiscount}
              discountError={discountError}
              errors={errors}
            />
          ) : currentStep === 2 ? (
            <BookingPaymentInfo
              fullName={fullName}
              phone={phone}
              email={email}
              address={resolvedAddress}
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
            actionDisabled={
              currentStep === 1 &&
              shippingMethod === "delivery" &&
              (isCalculating || shippingFee === 0 || !!shippingError)
            }
            onActionClick={
              currentStep === 1
                ? () => {
                    if (!validateForm()) return;
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

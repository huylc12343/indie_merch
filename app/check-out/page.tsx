"use client";

import { BookingStepper } from "@/components/bookingStepper/booking-stepper";
import { useEffect, useState } from "react";
import MerchBookingForm from "@/components/merchBookingForm/MerchBookingForm";
import { BookingPaymentInfo } from "@/components/bookingPaymentInfo/booking-payment-info";
import TicketSummaryAside from "@/components/merchBookingAside/ticket-summary-aside";
import { BookingSuccessInfo } from "@/components/bookingSuccessInfo/booking-success-info";
interface CartItem {
  cartKey: string;
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  selectedType?: string | null;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const data = localStorage.getItem("cart");

    if (data) {
      setCartItems(JSON.parse(data));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#2F2F2F]">
      {/* HEADER */}
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
              <MerchBookingForm />
            ) : currentStep === 2 ? (
              <BookingPaymentInfo
                fullName="huy"
                phone="0987654321"
                email="hudhasd"
                address="259 btxt"
              />
            ) : (
              <BookingSuccessInfo email="hudhasd" />
            )}
            <TicketSummaryAside
            cartItems={cartItems}
              onActionClick={
                currentStep === 1
                  ? () => {
                      setCurrentStep(2);
                    }
                  : currentStep === 2
                    ? () => {
                        setCurrentStep(3);
                      }
                    : undefined
              }
            />
          </div>
        </div>
      </section>
      {/* CONTENT */}
      {/* <section className="px-30">
        <div className="rounded-2xl bg-[#3A3A3A] p-6 shadow-2xl">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b border-white/10 pb-4 text-white"
              >
                <div>
                  <h2>{item.name}</h2>
                  <p>Số lượng: {item.quantity}</p>
                </div>

                <p>
                  {new Intl.NumberFormat("vi-VN").format(
                    item.price * item.quantity,
                  )}{" "}
                  đ
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
}

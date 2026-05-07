"use client";

import { BookingStepper } from "@/components/bookingStepper/booking-stepper";
import { useEffect, useState } from "react";
import MerchBookingForm from "@/components/merchBookingForm/MerchBookingForm";
import TicketSummaryAside from "@/components/merchBookingAside/ticket-summary-aside";
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: any;
  quantity: number;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("merch_cart");

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
            currentStep={1}
            steps={["Thông tin chung", "Thanh toán", "Xác nhận đơn hàng"]}
          />
        </div>
      </section>

      <section className="px-30">
        <div className="relative z-10 -mt-[80px]">
          <div className="flex flex-1 flex-row gap-5">
            <MerchBookingForm />
            <TicketSummaryAside />
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

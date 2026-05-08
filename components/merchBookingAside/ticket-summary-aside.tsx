"use client";

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import sample from "@/app/img_sample.png";


interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  selectedColor?: string | null;
  selectedSize?: string | null;
  selectedType?: string | null;
}
type TicketSummaryAsideProps = {
  title?: string;
  onActionClick?: () => void;
  cartItems: CartItem[];
};
export default function TicketSummaryAside({
  onActionClick,
  cartItems,
}: TicketSummaryAsideProps) {
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <aside className="w-full bg-white px-5 py-6 text-black lg:w-[387px] max-h-[444px]">
      <h3 className="text-xl font-bold">Thông tin đơn hàng</h3>

      {/* Header */}
      <div className="mt-5 flex items-center justify-between text-base font-bold">
        <p>Sản phẩm</p>
        <p>Số lượng</p>
      </div>

      {/* Product List */}
      <div className="mt-4 flex flex-col gap-5">
        {cartItems.map((item) => (
          <div key={item.id}>
            <div className="flex items-start justify-between gap-4">
              {/* Left */}
              <div className="flex gap-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={72}
                  height={72}
                  className="object-cover"
                />

                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-5">{item.name}</p>

                  <p className="mt-1 text-sm">{item.price}</p>

                  <div className="mt-1 w-fit bg-[#ECECEC] px-2 py-1 text-xs text-[#6C6C6C]">
                    {/* {item.selectedColor && <span>{item.selectedColor}</span>} */}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col items-end">
                <p className="text-sm">
                  {item.quantity.toString().padStart(2, "0")}
                </p>

                <p className="mt-1 text-sm">{item.price * item.quantity}</p>
              </div>
            </div>

            <div className="mt-5 h-px bg-[#D9D9D9]" />
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-5 flex items-center justify-between text-base font-bold">
        <p>Tạm tính</p>

        <p className="text-[#FF017E]">{subtotal}</p>
      </div>

      {/* Button */}
      <Button
        type="button"
        onClick={onActionClick}
        className="mt-5 h-14 w-full rounded-none bg-[#FF017E] text-base font-semibold text-white hover:bg-[#ff2f94]"
      >
        TIẾP TỤC
      </Button>

      {/* Policy */}
      {/* <p className="mt-4 text-center text-sm leading-5 text-black">
        Bấm TIẾP TỤC đồng nghĩa với việc bạn đã đồng ý với{" "}
        <Link
          href="https://drive.google.com/file/d/1ccyfaGF6m1mQP7GorqIYiD8806L5bwKd/view"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-sky-500 underline"
        >
          Điều khoản của chương trình
        </Link>
      </p>

      <p className="mt-3 text-center text-sm leading-5 text-black">
        Hãy liên hệ{" "}
        <Link
          href="https://www.facebook.com/indiindishow"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-sky-500 underline"
        >
          Hỗ trợ
        </Link>{" "}
        nếu bạn không thanh toán được
      </p> */}
    </aside>
  );
}

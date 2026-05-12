"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/lib/types";

type BookingSummaryAsideProps = {
  title?: string;
  cartItems: CartItem[];
  subtotal: number;
  shippingFee: number;
  discountCodeAmount: number;
  total: number;
  totalLabel?: string;
  actionLabel?: string;
  actionDisabled?: boolean;
  onActionClick?: () => void;
  showActionButton?: boolean;
  showPolicyNote?: boolean;
};

export default function BookingSummaryAside({
  title = "Thông tin đơn hàng",
  cartItems,
  subtotal,
  shippingFee,
  discountCodeAmount,
  total,
  totalLabel = "Tạm tính",
  actionLabel = "TIẾP TỤC",
  actionDisabled = false,
  onActionClick,
  showActionButton = true,
  showPolicyNote = false,
}: BookingSummaryAsideProps) {
  const handleActionClick = () => {
    if (actionDisabled) return;
    onActionClick?.();
  };

  return (
    <div className="flex flex-col w-full  lg:w-[387px]">
      <aside className=" bg-white px-5 py-6 pb-5 text-black h-fit">
        <h3 className="text-xl font-bold">{title}</h3>

        {/* Header */}
        <div className="mt-5 flex items-center justify-between text-base font-bold">
          <p>Sản phẩm</p>
          <p>Số lượng</p>
        </div>

        {/* Product List */}
        <div className="mt-4 flex flex-col gap-5">
          {cartItems.map((item) => (
            <div key={item.cartKey}>
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
                    <p className="text-xl font-medium leading-5">{item.name}</p>
                    <p className="mt-1 text-xl">
                      {new Intl.NumberFormat("vi-VN").format(item.price)} đ
                    </p>

                    <div className="mt-1 w-fit bg-[#ECECEC] px-2 py-1 text-xs text-black">
                      {[
                        item.selectedColor,
                        item.selectedSize,
                        item.selectedType,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-end">
                  <p className="text-sm">
                    {item.quantity.toString().padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-xl">
                    {new Intl.NumberFormat("vi-VN").format(
                      item.price * item.quantity,
                    )}{" "}
                    đ
                  </p>
                </div>
              </div>

              <div className="mt-5 h-px bg-[#D9D9D9]" />
            </div>
          ))}
        </div>

        {/* Shipping Fee */}
        <div className="mt-5 flex items-center justify-between text-base font-bold">
          <p>Phí vận chuyển</p>
          <p className="text-[#FF017E]">
            {shippingFee === 0
              ? "Miễn phí"
              : new Intl.NumberFormat("vi-VN").format(shippingFee) + " đ"}
          </p>
        </div>
        <div className="mt-5 h-px bg-[#D9D9D9]" />
        {discountCodeAmount > 0 && (
          <>
            <div className="mt-5 flex items-center justify-between text-base font-bold">
              <p>Giảm giá</p>

              <p className="text-green-500">
                - {new Intl.NumberFormat("vi-VN").format(discountCodeAmount)} đ
              </p>
            </div>

            <div className="mt-5 h-px bg-[#D9D9D9]" />
          </>
        )}
        {/* Total */}
        <div className="mt-5 flex items-center justify-between text-base font-bold">
          <p>{totalLabel}</p>
          <p className="text-[#FF017E]">
            {new Intl.NumberFormat("vi-VN").format(total) + " đ"}
          </p>
        </div>

        {/* Button */}
        {showActionButton ? (
          <Button
            type="button"
            onClick={handleActionClick}
            data-disabled={actionDisabled ? "true" : "false"}
            className="mt-5 h-14 w-full rounded-none bg-[#FF017E] text-base font-semibold text-white hover:bg-[#ff2f94] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60"
          >
            {actionLabel}
          </Button>
        ) : null}
      </aside>
      {showPolicyNote ? (
        <>
          <p className="mt-0 text-center text-sm leading-5 text-black bg-white p-4 pt-0">
            Bấm THANH TOÁN đồng nghĩa với việc bạn đã đồng ý với{" "}
            <Link
              href="https://drive.google.com/file/d/1ccyfaGF6m1mQP7GorqIYiD8806L5bwKd/view"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-500 underline"
            >
              Điều khoản của chương trình
            </Link>
          </p>
          <p className="mt-3 text-center text-sm leading-5 text-white">
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
          </p>
        </>
      ) : null}
    </div>
  );
}

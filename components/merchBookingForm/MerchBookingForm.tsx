import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DISCOUNT_CODE_TYPE } from "@/lib/types";
// import { TicketOptionCard } from "@/components/ticket-option-card";
// import type { DiscountCodeOutput, TicketTypeResolved } from "@/lib/schema";
// import { formatVnd } from "@/lib/utils";
import { useState } from "react";
type BookingFormProps = {
  shippingMethod: "pickup" | "delivery";
  fullName: string;
  phone: string;
  email: string;
  address: string;
  discountCode: string;

  appliedDiscount?: any;
  isApplyingDiscount?: boolean;

  onApplyDiscount?: () => void;
  onClearDiscount?: () => void;

  onShippingMethodChange: (value: "pickup" | "delivery") => void;

  setFullName: React.Dispatch<React.SetStateAction<string>>;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  setDiscountCode: React.Dispatch<React.SetStateAction<string>>;
};
export default function BookingForm({
  shippingMethod,
  fullName,
  phone,
  email,
  address,
  discountCode,

  appliedDiscount,
  isApplyingDiscount,
  onApplyDiscount,
  onClearDiscount,

  onShippingMethodChange,
  setFullName,
  setPhone,
  setEmail,
  setAddress,
  setDiscountCode,
}: BookingFormProps) {
  return (
    <>
      <div className="flex flex-col flex-1 pb-20">
        <section className="border-2 border-white bg-[#333333] px-5 py-6">
          <h2 className="font-retroguard text-3xl uppercase text-white lg:text-[32px] lg:leading-[48px]">
            1. NHẬP MÃ GIẢM GIÁ (NẾU CÓ)
          </h2>

          {appliedDiscount ? (
            <div className="mt-5 flex flex-col gap-2">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="flex h-14 items-center bg-[#171717] px-5 outline outline-2 -outline-offset-2 outline-[#24FFB0] lg:flex-1">
                  <span className="text-base text-[#24FFB0]">
                    {appliedDiscount.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClearDiscount}
                  className="h-14 cursor-pointer bg-[#60CAA4] px-6 text-base font-semibold text-black"
                >
                  ĐÃ ÁP DỤNG
                </button>
              </div>

              <p className="text-base text-[#24FFB0]">
                Đã giảm thêm{" "}
                {appliedDiscount.type === DISCOUNT_CODE_TYPE.FIXED
                  ? `${appliedDiscount.value}%`
                  : `${new Intl.NumberFormat("vi-VN").format(
                      appliedDiscount.value,
                    )} đ`}
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-2">
              <div className="flex flex-col gap-4 lg:flex-row">
                <Input
                  autoComplete="off"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onApplyDiscount?.();
                    }
                  }}
                  name="discount-code"
                  placeholder="Nhập mã giảm giá ở đây..."
                  className="h-14 rounded-none border-0 bg-[#171717] px-5 text-base text-white placeholder:text-[#A3A3A3] focus-visible:ring-0"
                />

                <Button
                  type="button"
                  disabled={!discountCode.trim() || isApplyingDiscount}
                  onClick={onApplyDiscount}
                  variant="outline"
                  className="h-14 rounded-none border-2 border-[#FF017E] bg-transparent px-6 text-base font-semibold text-[#FF017E] hover:bg-[#FF017E]/10 disabled:opacity-50"
                >
                  {isApplyingDiscount ? "ĐANG KIỂM TRA..." : "ÁP DỤNG"}
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="border-2 border-white bg-[#333333] mt-6 px-5 py-6">
          <h2 className="font-retroguard text-3xl uppercase text-white lg:text-[32px] lg:leading-[48px]">
            2. THÔNG TIN CÁ NHÂN
          </h2>
          <p className="mt-2 text-base leading-6 text-[#A3A3A3]">
            Chúng tôi sẽ gửi thông tin về đơn hàng bạn đã đặt và các thông tin
            liên quan đến chương trình qua địa chỉ email bạn cung cấp.
          </p>

          <div className="mt-5 flex flex-col gap-5">
            <div>
              <label
                htmlFor="fullName"
                className="mb-3 block text-base font-medium text-white"
              >
                Họ và tên <span className="text-[#FF4724]">*</span>
              </label>
              <Input
                id="fullName"
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                autoComplete="off"
                className="h-14 rounded-none border-0 bg-[#171717] px-5 text-base text-white placeholder:text-[#A3A3A3] focus-visible:ring-0"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-3 block text-base font-medium text-white"
                >
                  Số điện thoại <span className="text-[#FF4724]">*</span>
                </label>
                <Input
                  id="phone"
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  autoComplete="off"
                  className="h-14 rounded-none border-0 bg-[#171717] px-5 text-base text-white placeholder:text-[#A3A3A3] focus-visible:ring-0"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-3 block text-base font-medium text-white"
                >
                  Email <span className="text-[#FF4724]">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email"
                  autoComplete="off"
                  className="h-14 rounded-none border-0 bg-[#171717] px-5 text-base text-white placeholder:text-[#A3A3A3] focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="flex-1 border-2 border-white bg-[#333333] mt-6 px-5 py-6">
          <h2 className="font-retroguard text-3xl uppercase text-white lg:text-[32px] lg:leading-[48px]">
            3. HÌNH THỨC NHẬN HÀNG
          </h2>

          <RadioGroup
            defaultValue={shippingMethod}
            onValueChange={onShippingMethodChange}
            className="mt-5 w-full gap-4"
          >
            <div className="flex w-full items-start gap-4 bg-[#171717] p-4">
              {/* RADIO */}
              <RadioGroupItem
                value="delivery"
                id="delivery"
                className="h-6 w-6 size-4 border-[#6C6C6C] bg-[#333333] data-checked:border-[#6C6C6C] data-checked:bg-[#333333] disabled:cursor-not-allowed "
              />

              {/* CONTENT */}
              <label htmlFor="delivery" className="w-full cursor-pointer ">
                <div className="flex flex-col gap-4 ">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    {/* LEFT */}
                    <div className="flex-1">
                      <p className="text-2xl font-semibold text-white">
                        Ship tận nhà (Nhận hàng sau 3 ngày)
                      </p>

                      <ul className="mt-3 list-disc space-y-1 pl-5 text-base leading-7 text-white">
                        <li>Giao hàng tận nơi qua đường bưu điện</li>

                        <li>Thời gian giao hàng dự kiến: 7-10 ngày làm việc</li>

                        <li>Phí vận chuyển: 30.000đ/vé</li>
                      </ul>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col items-end gap-2 text-right">
                      <p className="text-lg leading-7 text-[#60CAA4]">
                        36.000 VND
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
            {/* chỉ hiện khi chọn delivery */}
            {shippingMethod === "delivery" && (
              <div className=" text-white text-lg bg-[#171717] p-4 pt-0 mt-[-20px] ">
                <h1 className="border-t-1 pt-4">
                  Hãy điền địa chỉ bạn muốn ship đến nhé!
                </h1>
                <Input
                  className="px-5 py-4 mt-4 bg-[#333333] border-none rounded-none placeholder:text-xl placeholder:font-normal text-2xl h-auto"
                  id="address"
                  onChange={(e) => setAddress(e.target.value)}
                  name="address"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            )}
            <div className="flex w-full items-start gap-4 bg-[#171717] p-4">
              {/* RADIO */}
              <RadioGroupItem
                value="pickup"
                id="pickup"
                className="h-6 w-6 size-4 border-[#6C6C6C] bg-[#333333] data-checked:border-[#6C6C6C] data-checked:bg-[#333333] disabled:cursor-not-allowed"
              />

              {/* CONTENT */}
              <label htmlFor="pickup" className="w-full cursor-pointer">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    {/* LEFT */}
                    <div className="flex-1">
                      <p className="text-2xl font-semibold text-white">
                        Nhận hàng trực tiếp tại Bụi Rock (Nhận hàng sau 5 ngày)
                      </p>

                      <ul className="mt-3 list-disc space-y-1 pl-5 text-base leading-7 text-white">
                        <li>Giao hàng tận nơi qua đường bưu điện</li>

                        <li>Thời gian giao hàng dự kiến: 7-10 ngày làm việc</li>

                        <li>Phí vận chuyển: 30.000đ/vé</li>
                      </ul>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col items-end gap-2 text-right">
                      <p className="text-lg leading-7 text-[#60CAA4]">
                        100.000 VND
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </RadioGroup>
        </section>
      </div>
    </>
  );
}

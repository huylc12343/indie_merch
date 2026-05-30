import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DISCOUNT_CODE_TYPE } from "@/lib/types";
// import { TicketOptionCard } from "@/components/ticket-option-card";
// import type { DiscountCodeOutput, TicketTypeResolved } from "@/lib/schema";
// import { formatVnd } from "@/lib/utils";
import { useState } from "react";
type BookingFormProps = {
  shippingMethod: "pickup_store" | "pickup_event" | "delivery";
  fullName: string;
  phone: string;
  email: string;
  address: string;
  discountCode: string;
  resolvedDiscountCodeAmount: number;
  appliedDiscount?: any;
  isApplyingDiscount?: boolean;
  isCalculatingShipping?: boolean;
  onApplyDiscount?: () => void;
  onClearDiscount?: () => void;
  shippingError?: string | null;
  onShippingMethodChange: (
    value: "pickup_store" | "pickup_event" | "delivery",
  ) => void;

  setFullName: (value: string) => void;
  setPhone: (value: string) => void;
  setEmail: (value: string) => void;
  setAddress: (value: string) => void;
  setDiscountCode: (value: string) => void;
  errors?: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  discountError?: string | null;
};
export default function BookingForm({
  shippingMethod,
  fullName,
  phone,
  email,
  address,
  discountCode,
  errors,
  resolvedDiscountCodeAmount,
  appliedDiscount,
  isApplyingDiscount,
  discountError,
  onApplyDiscount,
  onClearDiscount,
  isCalculatingShipping,
  onShippingMethodChange,
  setFullName,
  setPhone,
  setEmail,
  setAddress,
  shippingError,
  setDiscountCode,
}: BookingFormProps) {
  return (
    <>
      <div className="flex flex-col flex-1 pb-20">
        <section className="border-2 border-white bg-[#333333] px-5 py-6">
          <h2 className="font-retroguard text-xl md:text-2xl lg:text-[32px] uppercase text-white lg:leading-[48px]">
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
                  ? `${new Intl.NumberFormat("vi-VN").format(appliedDiscount.value)}đ`
                  : `${new Intl.NumberFormat("vi-VN").format(
                      resolvedDiscountCodeAmount,
                    )}đ (${appliedDiscount.value}%)`}
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-2">
              <div className="flex flex-col gap-3 lg:flex-row">
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
                  className="h-14 w-full rounded-none border-0 bg-[#171717] px-5 text-base text-white placeholder:text-[#A3A3A3] focus-visible:ring-0"
                />

                <Button
                  type="button"
                  disabled={!discountCode.trim() || isApplyingDiscount}
                  onClick={onApplyDiscount}
                  variant="outline"
                  className="h-14 w-full lg:w-auto rounded-none border-2 border-[#FF017E] bg-transparent px-6 text-base font-semibold text-[#FF017E] hover:bg-[#FF017E]/10 disabled:opacity-50"
                >
                  {isApplyingDiscount ? "ĐANG KIỂM TRA..." : "ÁP DỤNG"}
                </Button>
              </div>
              {discountError && (
                <p className="text-xl text-[#FF4724]">{discountError}</p>
              )}
            </div>
          )}
        </section>

        <section className="border-2 border-white bg-[#333333] mt-6 px-5 py-6">
          <h2 className="font-retroguard text-xl md:text-2xl lg:text-[32px] uppercase text-white lg:leading-[48px]">
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
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                autoComplete="off"
                className={`h-14 rounded-none border-0 bg-[#171717] px-5 text-base text-white placeholder:text-[#A3A3A3] focus-visible:ring-0 ${
                  errors?.fullName ? "border border-red-500" : ""
                }`}
              />
              {errors?.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  autoComplete="off"
                  className={`h-14 rounded-none border-0 bg-[#171717] px-5 text-base text-white placeholder:text-[#A3A3A3] focus-visible:ring-0 ${
                    errors?.phone ? "border border-red-500" : ""
                  }`}
                />
                {errors?.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email"
                  autoComplete="off"
                  className={`h-14 rounded-none border-0 bg-[#171717] px-5 text-base text-white placeholder:text-[#A3A3A3] focus-visible:ring-0 ${
                    errors?.email ? "border border-red-500" : ""
                  }`}
                />
                {errors?.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="flex-1 border-2 border-white bg-[#333333] mt-6 px-5 py-6">
          <h2 className="font-retroguard text-xl md:text-2xl lg:text-[32px] uppercase text-white lg:leading-[48px]">
            3. HÌNH THỨC NHẬN HÀNG
          </h2>

          <RadioGroup
            defaultValue={shippingMethod}
            onValueChange={onShippingMethodChange}
            className="mt-5 w-full gap-4"
          >
            <label
              htmlFor="pickup_store"
              className="flex w-full items-start gap-4 bg-[#171717] p-4 cursor-pointer"
            >
              {/* RADIO */}
              <RadioGroupItem
                value="pickup_store"
                id="pickup_store"
                className="mt-1 h-5 w-5 border-[#6C6C6C] bg-[#333333] 
               data-checked:border-[#6C6C6C] 
               data-checked:bg-[#333333]"
              />

              {/* CONTENT */}
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  {/* LEFT */}
                  <div className="flex-1">
                    <p className="text-lg md:text-xl lg:text-2xl font-semibold text-white">
                      Nhận trực tiếp tại Bụi Rock
                    </p>

                    <ul className="mt-3 list-disc space-y-1 pl-5 text-base leading-7 text-white">
                      <li>
                        Nhận tại Bụi Rock địa chỉ: E5, đường P. Đặng Văn Ngữ,
                        Kim Liên, Hà Nội
                      </li>
                      <li>Thời gian giao hàng dự kiến: 7-10 ngày làm việc</li>
                      <li>
                        Hướng dẫn nhận merch chi tiết sẽ được thông báo qua
                        fanpage và mail
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </label>
            <label
              htmlFor="pickup_event"
              className="flex w-full items-start gap-4 bg-[#171717] p-4 cursor-pointer"
            >
              {/* RADIO */}
              <RadioGroupItem
                value="pickup_event"
                id="pickup_event"
                className="mt-1 h-5 w-5 border-[#6C6C6C] bg-[#333333] 
               data-checked:border-[#6C6C6C] 
               data-checked:bg-[#333333]"
              />

              {/* CONTENT */}
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  {/* LEFT */}
                  <div className="flex-1">
                    <p className="text-lg md:text-xl lg:text-2xl font-semibold text-white">
                      Nhận trực tiếp tại In-đỉ In-đi:
                    </p>

                    <ul className="mt-3 list-disc space-y-1 pl-5 text-base leading-7 text-white">
                      <li>Nhận tại địa điểm tổ chức In-đỉ In-đi ngày 20/6</li>
                      <li>
                        Hướng dẫn nhận merch chi tiết sẽ được thông báo qua
                        fanpage và mail
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </label>
            <label
              htmlFor="delivery"
              className="flex w-full items-start gap-4 bg-[#171717] p-4 cursor-pointer"
            >
              {/* RADIO */}
              <RadioGroupItem
                value="delivery"
                id="delivery"
                className="mt-1 h-5 w-5 border-[#6C6C6C] bg-[#333333] 
               data-checked:border-[#6C6C6C] 
               data-checked:bg-[#333333]"
              />

              {/* CONTENT */}
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  {/* LEFT */}
                  <div className="flex-1">
                    <p className="text-lg md:text-xl lg:text-2xl font-semibold text-white">
                      Nhận qua ship
                    </p>

                    <ul className="mt-3 list-disc space-y-1 pl-5 text-base leading-7 text-white">
                      <li>Nhận merch tại địa chỉ bạn điền trong form</li>
                      <li>
                        Hướng dẫn nhận merch chi tiết sẽ được thông báo qua
                        fanpage và mail
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </label>

            {/* chỉ hiện khi chọn delivery */}
            {shippingMethod === "delivery" && (
              <div className=" text-white text-lg bg-[#171717] p-4 pt-0 mt-[-20px] ">
                <h1 className="border-t-1 pt-4">
                  Hãy điền địa chỉ bạn muốn ship đến nhé!
                </h1>
                <Input
                  id="address"
                  value={address}
                  className={`px-5 py-4 mt-4 bg-[#333333] border-none rounded-none placeholder:text-xl placeholder:font-normal text-2xl h-auto${
                    errors?.address ? "border border-red-500" : ""
                  }`}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, quận, tỉnh)"
                />
                {isCalculatingShipping && (
                  <p className="text-sm text-[#A3A3A3] mt-1">
                    Đang tính phí vận chuyển...
                  </p>
                )}
                {(errors?.address || shippingError) && (
                  <p className="text-red-500 text-xl mt-1">
                    {errors?.address || shippingError}
                  </p>
                )}
              </div>
            )}
          </RadioGroup>
        </section>
      </div>
    </>
  );
}

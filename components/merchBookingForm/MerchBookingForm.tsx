import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { TicketOptionCard } from "@/components/ticket-option-card";
// import type { DiscountCodeOutput, TicketTypeResolved } from "@/lib/schema";
// import { formatVnd } from "@/lib/utils";
export default function BookingForm() {
  return (
    <>
      <div className="flex flex-col flex-1 pb-20">
        <section className="w-full border-2 border-white bg-[#333333] px-5 py-6">
          <h2 className="font-retroguard text-3xl uppercase text-white lg:text-[32px] lg:leading-[48px]">
            1. NHẬP MÃ GIẢM GIÁ (NẾU CÓ)
          </h2>

          <div className="mt-5 flex flex-col gap-2">
            <div className="flex flex-col gap-4 lg:flex-row">
              <Input
                autoComplete="off"
                name="discount-code"
                placeholder="Nhập mã giảm giá ở đây..."
                className="h-14 rounded-none border-0 bg-[#171717] px-5 text-base text-white placeholder:text-[#A3A3A3] focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="outline"
                className="h-14 rounded-none border-2 border-[#FF017E] bg-transparent px-6 text-base font-semibold text-[#FF017E] hover:bg-[#FF017E]/10"
              >
                ÁP DỤNG
              </Button>
            </div>
          </div>
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

          <RadioGroup defaultValue="ticket" className="mt-5 w-full gap-4">
            <div className="flex w-full items-start gap-4 bg-[#171717] p-4">
              {/* RADIO */}
              <RadioGroupItem
                value="ticket"
                id="ticket"
                className="h-6 w-6 size-4 border-[#6C6C6C] bg-[#333333] data-checked:border-[#6C6C6C] data-checked:bg-[#333333] disabled:cursor-not-allowed"
              />

              {/* CONTENT */}
              <label htmlFor="ticket" className="w-full cursor-pointer">
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
                        <div className="flex w-full items-start gap-4 bg-[#171717] p-4">
              {/* RADIO */}
              <RadioGroupItem
                value="ticket"
                id="ticket"
                className="h-6 w-6 size-4 border-[#6C6C6C] bg-[#333333] data-checked:border-[#6C6C6C] data-checked:bg-[#333333] disabled:cursor-not-allowed"
              />

              {/* CONTENT */}
              <label htmlFor="ticket" className="w-full cursor-pointer">
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

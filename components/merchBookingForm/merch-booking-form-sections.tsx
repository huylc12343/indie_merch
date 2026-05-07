import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { TicketOptionCard } from "@/components/ticket-option-card";
import type { DiscountCodeOutput, TicketTypeResolved } from "@/lib/schema";
import { formatVnd } from "@/lib/utils";

type BookingFormSectionsProps = {
  ticketTypes: TicketTypeResolved[];
  selectedTicketId: string;
  quantity: number;
  effectiveMaxPerOrder: number;
  discountCode: string;
  appliedDiscount: DiscountCodeOutput | null;
  discountCodeAmount: number;
  fullName: string;
  phone: string;
  email: string;
  onTicketChange: (ticketId: string) => void;
  onDecrease: () => void;
  onIncrease: () => void;
  onDiscountCodeChange: (value: string) => void;
  onApplyDiscount: () => void;
  isApplyingDiscount: boolean;
  onClearDiscount: () => void;
  onFullNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
};

export function BookingFormSections({
  ticketTypes,
  selectedTicketId,
  quantity,
  effectiveMaxPerOrder,
  discountCode,
  appliedDiscount,
  discountCodeAmount,
  fullName,
  phone,
  email,
  onTicketChange,
  onDecrease,
  onIncrease,
  onDiscountCodeChange,
  onApplyDiscount,
  isApplyingDiscount,
  onClearDiscount,
  onFullNameChange,
  onPhoneChange,
  onEmailChange,
}: BookingFormSectionsProps) {
  return (
    <div className="flex-1 space-y-6">
      <section className="flex-1 border-2 border-white bg-[#333333] px-5 py-6">
        <h2 className="font-heading text-3xl uppercase text-white lg:text-[32px] lg:leading-[48px]">
          1. LOẠI VÉ & SỐ LƯỢNG
        </h2>
        <p className="mt-2 text-base leading-6 text-[#A3A3A3]">
          *Mỗi đơn hàng chỉ áp dụng cho{" "}
          <span className="font-bold">một loại vé</span>. Số lượng tối đa:{" "}
          <span className="font-bold">{effectiveMaxPerOrder} vé/đơn</span>
        </p>

        <RadioGroup
          value={selectedTicketId}
          onValueChange={onTicketChange}
          className="mt-5 gap-4"
        >
          {ticketTypes.map((ticket) => {
            const ticketEffectiveMaxPerOrder =
              selectedTicketId === ticket.id
                ? effectiveMaxPerOrder
                : Math.min(
                    ticket.max_per_order,
                    Math.max(0, ticket.quantity_total - ticket.quantity_sold)
                  );

            return (
              <TicketOptionCard
                key={ticket.id}
                ticket={ticket}
                selected={selectedTicketId === ticket.id}
                disabled={ticketEffectiveMaxPerOrder <= 0}
                quantity={quantity}
                effectiveMaxPerOrder={ticketEffectiveMaxPerOrder}
                onDecrease={onDecrease}
                onIncrease={onIncrease}
              />
            );
          })}
        </RadioGroup>
      </section>

      <section className="border-2 border-white bg-[#333333] px-5 py-6">
        <h2 className="font-heading text-3xl uppercase text-white lg:text-[32px] lg:leading-[48px]">
          2. NHẬP MÃ GIẢM GIÁ (NẾU CÓ)
        </h2>

        {appliedDiscount ? (
          <div className="mt-5 flex flex-col gap-2">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex h-14 lg:flex-1 items-center bg-[#171717] px-5 outline outline-2 -outline-offset-2 outline-[#24FFB0]">
                <span className="text-base text-[#24FFB0]">{appliedDiscount.code}</span>
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
              Đã giảm thêm {formatVnd(discountCodeAmount, "VND")}
            </p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            <div className="flex flex-col gap-4 lg:flex-row">
              <Input
                value={discountCode}
                onChange={(event) => onDiscountCodeChange(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") onApplyDiscount(); }}
                autoComplete="off"
                name="discount-code"
                placeholder="Nhập mã giảm giá ở đây..."
                className="h-14 rounded-none border-0 bg-[#171717] px-5 text-base text-white placeholder:text-[#A3A3A3] focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="outline"
                onClick={onApplyDiscount}
                disabled={!discountCode.trim() || isApplyingDiscount}
                className="h-14 rounded-none border-2 border-[#FF017E] bg-transparent px-6 text-base font-semibold text-[#FF017E] hover:bg-[#FF017E]/10"
              >
                {isApplyingDiscount ? "ĐANG KIỂM TRA..." : "ÁP DỤNG"}
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="border-2 border-white bg-[#333333] px-5 py-6">
        <h2 className="font-heading text-3xl uppercase text-white lg:text-[32px] lg:leading-[48px]">
          3. THÔNG TIN CÁ NHÂN
        </h2>
        <p className="mt-2 text-base leading-6 text-[#A3A3A3]">
          Chúng mình sẽ gửi thông tin về vé, đơn hàng và các thông tin liên quan đến
          chương trình qua địa chỉ email bạn cung cấp.
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
              onChange={(event) => onFullNameChange(event.target.value)}
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
                value={phone}
                onChange={(event) => onPhoneChange(event.target.value)}
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
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="Nhập email"
                autoComplete="off"
                className="h-14 rounded-none border-0 bg-[#171717] px-5 text-base text-white placeholder:text-[#A3A3A3] focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

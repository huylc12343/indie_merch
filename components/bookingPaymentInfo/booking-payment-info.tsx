type BookingPaymentInfoProps = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  onEdit: () => void;
};

export function BookingPaymentInfo({
  fullName,
  phone,
  email,
  address,
  onEdit,
}: BookingPaymentInfoProps) {
  return (
    <div className="flex flex-col flex-1 pb-20">
      <section className="flex flex-col wrap-content border-2 border-white bg-[#333333] px-5 py-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-retroguard text-3xl uppercase text-white md:text-[32px] md:leading-[48px]">
            THÔNG TIN THANH TOÁN
          </h2>
          <button
          type="button"
          onClick={onEdit}
          className="text-base font-semibold text-[#5073CF] hover:underline"
        >
          CHỈNH SỬA THÔNG TIN
        </button>
        </div>

        <div className="mt-5 space-y-3 text-base leading-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <p className="font-medium">Họ và tên</p>
            <p className="text-right font-bold">{fullName}</p>
          </div>

          <div className="flex items-start justify-between gap-4">
            <p className="font-medium">Số điện thoại liên lạc</p>
            <p className="text-right font-bold">{phone}</p>
          </div>

          <div className="flex items-start justify-between gap-4">
            <p className="font-medium">Email</p>
            <p className="text-right font-bold">{email}</p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <p className="font-medium">Địa chỉ nhận hàng</p>
            <p className="text-right font-bold">{address}</p>
          </div>
        </div>

        <p className="mt-5 text-base leading-6 text-[#FFBE48]">
          Chúng mình sẽ gửi vé điện tử, thông tin đơn hàng và các nội dung liên
          quan đến chương trình tới địa chỉ email{" "}
          <span className="font-semibold">{email}</span> mà bạn đã cung cấp,
          trong vòng tối đa 10 phút sau khi thanh toán hoàn tất.
        </p>
      </section>
    </div>
  );
}

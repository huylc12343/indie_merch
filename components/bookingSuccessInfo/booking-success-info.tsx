import Image from "next/image";
import Link from "next/link";
import facebook from "@/app/facebook.svg";
import instagram from "@/app/instagram.svg";
import tiktok from "@/app/tiktok.svg";
type BookingSuccessInfoProps = {
  email: string;
};

export function BookingSuccessInfo({ email }: BookingSuccessInfoProps) {
  return (
    <div className="space-y-4">
      <section className="border-2 border-white bg-[#333333] px-5 py-6">
        <h2 className="font-heading text-3xl uppercase text-white md:text-[32px] md:leading-[48px]">
          XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG
        </h2>
        <p className="mt-3 text-base leading-6 text-[#60CAA4]">
          Chúng mình đã gửi thông tin về vé điện tử đến địa chỉ email <span className="font-bold">{email}</span>.
          Hãy check email của bạn ngay nhé. Lưu ý kiểm tra trong các mục Quảng Cáo và Spam/Junk trong Gmail nữa nha.
        </p>
        <p className="mt-3 text-base leading-6 text-[#60CAA4]">
          Email gửi vé sẽ được gửi từ: ticket.indi.indi.show@gmail.com
          <br />
          Tiêu đề email dự kiến: [In-đỉ In-đi] XÁC NHẬN ĐẶT VÉ THÀNH CÔNG
        </p>
        <p className="mt-3 text-sm leading-5 text-white">
          Hãy liên hệ{" "}
          <Link
            href="https://www.facebook.com/indiindishow"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-500 underline"
          >
            Hỗ trợ
          </Link>{" "}
          nếu bạn không nhận được email.
        </p>
      </section>

      <section className="border-2 border-white bg-[#333333] px-5 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-3xl uppercase text-white md:text-[32px] md:leading-[48px]">
            THEO DÕI FANPAGE CỦA CHƯƠNG TRÌNH
          </h3>
          <div className="flex items-center gap-3 text-white">
            <Link
              href="https://www.facebook.com/indiindishow"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex size-8 cursor-pointer items-center justify-center transition-opacity hover:opacity-80"
            >
              <Image src={facebook} alt="" width={32} height={32} aria-hidden="true" />
            </Link>
            <Link
              href="https://www.instagram.com/indi.indi.show"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-8 cursor-pointer items-center justify-center transition-opacity hover:opacity-80"
            >
              <Image src={instagram} alt="" width={32} height={32} aria-hidden="true" />
            </Link>
            <Link
              href="https://www.tiktok.com/@indi.indi.show"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex size-8 cursor-pointer items-center justify-center transition-opacity hover:opacity-80"
            >
              <Image src={tiktok} alt="" width={32} height={32} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <p className="mt-3 text-base leading-6 text-white">
          Hãy theo dõi fanpage của chương trình để luôn được cập nhật thông tin thường
          xuyên.
        </p>
      </section>
    </div>
  );
}

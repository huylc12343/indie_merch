"use client";

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
    <div className="flex justify-center">
      <div className="space-y-4 w-full max-w-[793px] min-[1441px]:max-w-full mx-auto">
        {/* ===== SUCCESS ===== */}
        <section className="border-2 border-white bg-[#333333] px-4 md:px-5 py-5 md:py-6">
          <h2 className="font-retroguard text-xl md:text-2xl lg:text-[32px] uppercase text-white lg:leading-[48px]">
            XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG
          </h2>

          <p className="mt-3 text-sm md:text-base leading-6 text-[#60CAA4]">
            Chúng mình sẽ gửi thông tin đơn hàng và các nội dung liên quan đến
            chương trình tới địa chỉ email{" "}
            <span className="font-bold break-words">{email}</span> mà bạn đã
            cung cấp, trong vòng tối đa 10 phút sau khi thanh toán hoàn tất.
          </p>

          {/* <p className="mt-3 text-sm md:text-base leading-6 text-[#60CAA4]">
          Email gửi vé sẽ được gửi từ:
          <br className="hidden md:block" />
          <span className="break-all">ticket.indi.indi.show@gmail.com</span>
          <br />
          Tiêu đề email dự kiến:
          <br className="hidden md:block" />
          <span className="break-words">
            [In-đỉ In-đi] XÁC NHẬN ĐẶT VÉ THÀNH CÔNG
          </span>
        </p> */}

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

        {/* ===== SOCIAL ===== */}
        <section className="border-2 border-white bg-[#333333] px-4 md:px-5 py-5 md:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* TITLE */}
            <h3 className="font-heading text-xl md:text-2xl lg:text-[32px] uppercase text-white lg:leading-[48px]">
              THEO DÕI FANPAGE
            </h3>

            {/* ICONS */}
            <div className="flex items-center gap-4">
              <Link
                href="https://www.facebook.com/indiindishow"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex w-10 h-10 md:w-8 md:h-8 items-center justify-center hover:opacity-80"
              >
                <Image src={facebook} alt="" width={32} height={32} />
              </Link>

              <Link
                href="https://www.instagram.com/indi.indi.show"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex w-10 h-10 md:w-8 md:h-8 items-center justify-center hover:opacity-80"
              >
                <Image src={instagram} alt="" width={32} height={32} />
              </Link>

              <Link
                href="https://www.tiktok.com/@indi.indi.show"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex w-10 h-10 md:w-8 md:h-8 items-center justify-center hover:opacity-80"
              >
                <Image src={tiktok} alt="" width={32} height={32} />
              </Link>
            </div>
          </div>

          <p className="mt-3 text-sm md:text-base leading-6 text-white">
            Hãy theo dõi fanpage của chương trình để luôn được cập nhật thông
            tin thường xuyên.
          </p>
        </section>
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import FooterIcon from "@/app/pink_logo.svg";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#171717] text-white font-[var(--font-inter)] px-4 py-12 md:px-20 md:py-32">
      {/* Logo */}
      <div className="mb-10">
        <Image src={FooterIcon} alt="icon-pink" className="w-auto " />
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row gap-10 md:gap-15 md:justify-between">
        {/* LEFT */}
        <div className="max-w-full md:max-w-[817px]">
          <p className="text-sm md:text-[20px] leading-6 text-gray-300">
            In-đỉ In-đi là không gian nơi âm nhạc độc lập được kể và được lắng
            nghe, nơi nghệ sĩ và khán giả gặp nhau trong cùng một tần số cảm
            xúc.
          </p>

          <h3 className="mt-6 mb-3 text-base font-semibold">Liên hệ</h3>

          <ul className="space-y-3 text-sm md:text-base text-gray-300">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              096 802 30 65
            </li>

            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              indi.indi.show@gmail.com
            </li>

            {/* <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              205 Giải Phóng, Hà Nội
            </li> */}
          </ul>
        </div>

        {/* MIDDLE */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-400">
            ĐIỀU HƯỚNG
          </h3>

          <ul className="space-y-2 text-lg md:text-2xl font-bold">
            <li>
              <Link href="https://indiindishow.com/">Trang chủ</Link>
            </li>
            <li>
              <Link href="https://indiindishow.com/about">Về chúng mình</Link>
            </li>
            <li>
              <Link href="https://indiindishow.com/event">Sự kiện</Link>
            </li>
            {/* <li>
              <Link href="/">Minigame</Link>
            </li> */}
            <li>
              <Link href="/">Merchandise</Link>
            </li>
          </ul>
        </div>

        {/* RIGHT */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-400">SOCIAL</h3>

          <ul className="space-y-2 text-lg md:text-2xl font-bold">
            <li>
              <Link
                href="https://www.facebook.com/indiindishow"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </Link>
            </li>
            <li>
              <Link
                href="https://www.instagram.com/indi.indi.show"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </Link>
            </li>
            <li>
              <Link
                href="https://www.tiktok.com/@indi.indi.show"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tiktok
              </Link>
            </li>
            <li>
              <Link
                href="https://www.threads.com/@indi.indi.show"
                target="_blank"
                rel="noopener noreferrer"
              >
                Threads
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import Image from "next/image";
import FooterIcon from "@/app/pink_logo.svg"
import { Phone,Mail, MapPin } from "lucide-react";
export default function Footer() {
  return (
    <div className="footer px-20 py-40 bg-[#171717] text-white font-[var(--font-inter)]">
      <Image src={FooterIcon} alt="icon-pink" />
      <div className="flex justify-between gap-15 mt-25">
        <div className="flex-col max-w-[817px]">
          <span className="text-xl leading-6 tracking-normal">
            In-đỉ In-đi là không gian nơi âm nhạc độc lập được kể và được lắng
            nghe, nơi nghệ sĩ và khán giả gặp nhau trong cùng một tần số cảm
            xúc.
          </span>
          <h3 className="mt-10 mb-5">Liên hệ</h3>
          <ul className="gap-5">
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                09987654321
              </li>

              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                123@gmail.com
              </li>

              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                205 giải phóng, hà nội
              </li>
            </ul>
          </ul>
        </div>
        <div className="flex-col">
          <h3 className="font-normalleading-[20px] text-[16px]">ĐIỀU HƯỚNG</h3>
          <ul className="font-bold text-[28px] leading-[36px] tracking-normal space-y-2">
            <li>
              <Link href={"/"}>Trang chủ</Link>
            </li>
            <li>
              <Link href={"/"}>Về chúng mình</Link>
            </li>
            <li>
              <Link href={"/"}>Sự kiện</Link>
            </li>
            <li>
              <Link href={"/"}>Minigame</Link>
            </li>
            <li>
              <Link href={"/"}>Merchandise</Link>
            </li>
          </ul>
        </div>
        <div className="flex-col">
          <h3 className="font-normalleading-[20px] text-[16px]">SOCIAL</h3>
          <ul className="font-bold text-[28px] leading-[36px] tracking-normal space-y-2">
            <li>
              <Link href={"/"}>Facebook</Link>
            </li>
            <li>
              <Link href={"/"}>Instagram</Link>
            </li>
            <li>
              <Link href={"/"}>Tiktok</Link>
            </li>
            <li>
              <Link href={"/"}>Threads</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import sample from "@/app/img_sample.png";
import merchText from "./merch-text.svg";
import Merch from "./MERCHANDISE.svg";
import MerchInfo from "@/components/merchInfo/merchInfo";
const merchData = [
  {
    id: 1,
    name: "khăn cmm",
    price: 367000,
    image: sample,
    description: "abcdefgheijdskajd",
  },
  {
    id: 2,
    name: "khăn mmb",
    price: 367000,
    image: sample,
    description:
      "Kích thước: 70*70 cm \n \n Khăn lụa xanh đậm với họa tiết xoáy nước đặc trưng, chất vải mềm nhẹ, dễ sử dụng để quàng cổ, cột túi hoặc đơn giản là giữ làm kỷ niệm. Một món phụ kiện vừa đẹp vừa mang dấu ấn riêng.",
  },
];
export default function Home() {
  return (
    <div className="flex-col px-20 py-15">
      <div className="flex w-full gap-5 justify-between">
        <div className="flex flex-col l justify-start w-1/2 max-w-[630px] ">
          {/* <Image src={Merch} alt="merch-text" width={630} height={48} /> */}
          <h1 className="font-retroguard text-8xl leading-[0.6] tracking-normal font-normal  ">
            MERCHANDISE{" "}
          </h1>
          <p className=" mt-8 text-2xl leading-7 tracking-normal font-normal max-w-[630px]">
            Khám phá các sản phẩm merch được thiết kế độc quyền, tất cả đều được
            chăm chút để bạn không chỉ dùng, mà còn{" "}
            <span className="font-bold">cảm</span> được.
          </p>
        </div>
        <div className="flex flex-col r justify-end w-1/2 max-w-[630px]">
          <div className="merch-menu">
            <div className="merch-item">
              {merchData.map((item) => (
                <MerchInfo key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-col w-full mt-40">
        <h1 className="font-retroguard text-6xl leading-[0.6] tracking-normal font-normal ">
          điều khoản giao hàng & đổi trả hàng
        </h1>
        <ul className=" mt-8 text-xl leading-7 max-w-[847px] list-disc pl-8">
          {" "}
          <li>
            Chúng mình <span className="font-bold">không áp dụng đổi/trả </span>
            sau khi đã xác nhận thanh toán thành công vì bất kỳ lý do gì.
          </li>
          <li>
            Mọi thắc mắc hãy trao đổi trực tiếp với chúng mình qua fanpage{" "}
            <span className="text-[var(--color-primary-pink)] font-bold">
              In-đỉ In-đi
            </span>{" "}
            hoặc email chính thức của chương trình{" "}
            <span className="text-[var(--color-primary-pink)] font-bold">
              indi.indi.show@gmail.com
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

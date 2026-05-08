import sample from "@/app/img_sample.png";
import { fetchMerch } from "@/lib/fetchMerch";
import MerchInfo from "@/components/merchInfo/merchInfo";
const merchData = await fetchMerch();

// const merchData = [
//   {
//     id: "1",
//     name: "áo b",
//     price: 367000,

//     sizes: ["S", "M", "L", "XL"],

//     colors: ["Đen", "Trắng"],

//     types: ["Oversize", "T-Shirt"],

//     description:
//       "Kích thước: 70*70 cm \n \n Khăn lụa xanh đậm với họa tiết xoáy nước đặc trưng, chất vải mềm nhẹ, dễ sử dụng để quàng cổ, cột túi hoặc đơn giản là giữ làm kỷ niệm.",

//     quantity: 10,

//     status: "active",

//     merchimages: [
//       {
//         directus_files_id: sample.src,
//       },
//       {
//         directus_files_id: sample.src,
//       },
//       {
//         directus_files_id: sample.src,
//       },
//     ],
//   },

//   {
//     id: "2",

//     name: "khăn a",

//     price: 367000,

//     sizes: [],

//     colors: ["Đỏ", "Xanh", "Vàng"],

//     types: ["Scarf"],

//     description:
//       "Lorem ipsum dolor sit amet consectetur adipisicing elit.",

//     quantity: 20,

//     status: "active",

//     merchimages: [
//       {
//         directus_files_id: sample.src,
//       },
//       {
//         directus_files_id: sample.src,
//       },
//     ],
//   },
// ];
// const merchData = [
//   {
//     id: 1,
//     name: "áo b",
//     price: 367000,
//     thumbImage: sample,
//     sizes: ["S", "M", "L", "XL"],
//     colors: ["Đen", "Trắng"],
//     merchImages: [sample, sample, sample, sample, sample],
//     description:
//       "Kích thước: 70*70 cm \n \n Khăn lụa xanh đậm với họa tiết xoáy nước đặc trưng, chất vải mềm nhẹ, dễ sử dụng để quàng cổ, cột túi hoặc đơn giản là giữ làm kỷ niệm. Một món phụ kiện vừa đẹp vừa mang dấu ấn riêng.",
//   },
//   {
//     id: 2,
//     name: "khăn a",
//     price: 367000,
//     thumbImage: sample,
//     colors: ["Đỏ", "Xanh", "Vàng"],
//     merchImages: [sample, sample, sample, sample],
//     description:
//       "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ducimus veritatis nihil asperiores iure itaque quas minus nostrum reprehenderit mollitia amet? Omnis beatae consectetur officiis. Deleniti provident minima dolores repudiandae maiores.Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ducimus veritatis nihil asperiores iure itaque quas minus nostrum reprehenderit mollitia amet? Omnis beatae consectetur officiis. Deleniti provident minima dolores repudiandae maiores.",
//   },
// ];
export default function Home() {
  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-10 xl:px-20 py-15">
        <div className="flex-col  ">
          <div className="flex w-full gap-16 justify-between">
            {/* LEFT */}
            <div className="w-full max-w-[620px] sticky top-[174px] self-start">
              <div className="flex flex-col justify-start">
                <h1 className="font-retroguard text-8xl leading-[0.8]">
                  MERCHANDISE
                </h1>

                <p className="mt-8 text-2xl leading-7">
                  Khám phá các sản phẩm merch được thiết kế độc quyền, tất cả
                  đều được chăm chút để bạn không chỉ dùng, mà còn{" "}
                  <span className="font-bold">cảm</span> được.
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="w-full max-w-[620px]">
              <div className="flex flex-col gap-6">
                {merchData.map((item) => (
                  <MerchInfo key={item.id} item={item} />
                ))}
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
                Chúng mình{" "}
                <span className="font-bold">không áp dụng đổi/trả </span>
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
      </div>
    </div>
  );
}

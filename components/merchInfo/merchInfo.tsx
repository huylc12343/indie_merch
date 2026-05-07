"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { X, Minus, Plus } from "lucide-react";
interface Variant {
  type?: string;
  color?: string;
  size?: string;
}
interface MerchItem {
  id: number;
  name: string;
  price: number;
  thumbImage: StaticImageData;
  quantity?: number;
  merchImages?: StaticImageData[];
  colors?: string[];
  sizes?: string[];
  variants?: Variant[];
  description?: string;
}
export default function MerchInfo({ item }: { item: MerchItem }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className="merch-item hover:cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Image src={item.thumbImage} alt="sample" width={630} height={630} />
        <div className="merch-info pt-3 text-3xl">
          <span className="font-semibold">{item.name}</span>
          {" - "}
          <span className="font-normal">
            {new Intl.NumberFormat("vi-VN").format(item.price)} đ
          </span>{" "}
        </div>
      </div>
      {/* open */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="flex flex-col max-w-[1000px] bg-white">
            <div className=" flex justify-between items-center p-8 pb-7">
              <h1 className="font-retroguard text-[28px]">Chi tiết</h1>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="w-8 h-8 p-0 flex items-center hover:cursor-pointer justify-center"
              >
                <div className="w-5 h-5 flex items-center  justify-center">
                  <X className="w-2.5 h-2.5" />
                </div>
              </Button>
            </div>
            <div className="flex mx-8 mb-10 gap-6">
              <div className="flex flex-col max-w-[452px] mt-4">
                <Image src={item.thumbImage} width={460} height={460} alt="" />

                <div className="flex mt-5 gap-3 overflow-x-auto">
                  {item.merchImages?.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      width={120}
                      height={120}
                      alt={`merch-image-${index}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-col max-w-[452px] min-w-[452px] ">
                <div className="flex-1 overflow-y-auto min-h-[520px] max-h-[520px]">
                  <span className="font-retroguard text-[50px] leading-[60px] -tracking-normal font-normal">
                    {item.name}
                  </span>
                  <h1 className="text-5xl leading-13 font-bold text-[var(--color-primary-pink)] mt-4">
                    {" "}
                    {new Intl.NumberFormat("vi-VN").format(item.price)} đ
                  </h1>
                  <div className="flex items-center gap-4 py-2 rounded-md w-fit">
                    {/* Button - */}
                    <Button
                      variant="outline"
                      className="w-8 h-8 p-0 flex hover:cursor-pointer items-center rounded-none border-[#171717] justify-center"
                    >
                      <Minus className="w-4 h-4  rounded-none" />
                    </Button>

                    {/* Quantity */}
                    <span className="w-8 text-center">1</span>

                    {/* Button + */}
                    <Button
                      variant="outline"
                      className="w-8 h-8 p-0 flex items-center rounded-none hover:cursor-pointer border-[#171717] justify-center"
                    >
                      <Plus className="w-4 h-4 rounded-none" />
                    </Button>

                    {/* Stock */}
                    <span className="text-sm text-gray-500 ml-2">Kho: 10</span>
                  </div>
                  <h3 className="mt-10 text-[#6C6C6C]">Phân loại</h3>
                  {item.colors && (
                    <>
                      <h3 className="mt-4">Màu sắc</h3>
                      <div className="flex">
                        {item.colors.map((color, index) => (
                          <Button
                            key={index}
                            className="rounded-none bg-[#f5f5f5] text-[#333333]"
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                  {item.sizes && (
                    <>
                      <h3 className="mt-4">Kích thước</h3>
                      <div className="flex">

                        {item.sizes.map((size, index) => (
                          <Button
                            key={index}
                            className="rounded-none bg-[#f5f5f5] hover:cursor-pointer text-[#333333]"
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                  <h3 className="mt-10">Mô tả sản phẩm</h3>
                  <p className="mt-4 text-[#6C6C6C] mb-10">
                    {item.description}
                  </p>
                </div>
                <div className="flex gap-4 pt-4 mt-4">
                  <Button
                    variant="outline"
                    className="h-14 rounded-none hover:cursor-pointer border-[#171717] px-5 text-2xl font-semibold"
                  >
                    Thêm vào giỏ hàng
                  </Button>

                  <Button className="h-14 hover:cursor-pointer rounded-none px-5 text-2xl font-semibold">
                    Mua ngay
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { X, Minus, Plus } from "lucide-react";
import { MerchItem } from "@/lib/types";
import { CartItem } from "@/lib/types";
const getImageUrl = (id: string) => {
  if (!id) {
    console.warn("Missing image id");
    return "";
  }
  return `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${id}`;
};
export default function MerchInfo({ item }: { item: MerchItem }) {
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    item.colors?.[0] || null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    item.sizes?.[0] || null,
  );
  const [selectedType, setSelecteType] = useState<string | null>(
    item.types?.[0] || null,
  );
  const [quantity, setQuantity] = useState(1);

  const [selectedImageId, setSelectedImageId] = useState<string | undefined>(
    item.merch_images?.[0]?.directus_files_id?.id,
  );
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeSelected = (size: string) => {
    setSelectedSize(size);
  };
  const handleTypeSelect = (type: string) => {
    setSelecteType(type);
  };
  const handleAddToCart = () => {
    const cartKey = [item.id, selectedColor, selectedSize, selectedType].join(
      "-",
    );

    const newItem: CartItem = {
      cartKey,

      id: item.id,

      name: item.name,

      price: item.price,

      quantity,

      image: getImageUrl(
        item.merch_images?.[0]?.directus_files_id.id || "./placeholder.png",
      ),

      selectedColor,

      selectedSize,

      selectedType,
      availableColors: item.colors,
      availableSizes: item.sizes,
      availableTypes: item.types,
    };

    const existingCart = localStorage.getItem("cart");

    const cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];

    const existingItemIndex = cart.findIndex((i) => i.cartKey === cartKey);

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    console.log("Added to cart", cart);
  };
  return (
    <>
      <div
        className="merch-item hover:cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Image
          src={getImageUrl(
            item.merch_images?.[0]?.directus_files_id.id || "/placeholder.png",
          )}
          alt={item.name}
          width={630}
          height={630}
        />
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
                <Image
                  src={getImageUrl(selectedImageId || "./")}
                  width={460}
                  height={460}
                  alt={item.name}
                />
                <div className="flex mt-5 gap-3 overflow-x-auto">
                  {item.merch_images?.map((img, index) => {
                    const imgId = img.directus_files_id.id;

                    return (
                      <Image
                        key={index}
                        src={getImageUrl(imgId)}
                        width={120}
                        height={120}
                        alt={`merch-image-${index}`}
                        className={`cursor-pointer border-2 ${
                          selectedImageId === imgId
                            ? "border-[var(--color-primary-pink)]"
                            : "border-transparent"
                        }`}
                        onClick={() => setSelectedImageId(imgId)}
                      />
                    );
                  })}
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
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                      className="w-8 h-8 p-0 flex hover:cursor-pointer items-center rounded-none border-[#171717] justify-center"
                    >
                      <Minus className="w-4 h-4  rounded-none" />
                    </Button>

                    {/* Quantity */}
                    <span className="w-8 text-center">{quantity}</span>

                    {/* Button + */}
                    <Button
                      variant="outline"
                      onClick={() =>
                        setQuantity((prev) =>
                          Math.min(item.quantity || 1, prev + 1),
                        )
                      }
                      className="w-8 h-8 p-0 flex items-center rounded-none hover:cursor-pointer border-[#171717] justify-center"
                    >
                      <Plus className="w-4 h-4 rounded-none" />
                    </Button>

                    {/* Stock */}
                    <span className="text-sm text-gray-500 ml-2">
                      Kho: {item.quantity}
                    </span>
                  </div>
                  <h3 className="mt-10 text-[#6C6C6C]">Phân loại</h3>
                  {item.types && item.types.length > 0 && (
                    <>
                      <h3 className="mt-4">Loại</h3>
                      <div className="flex">
                        {item.types.map((type, index) => {
                          const isSelected = selectedType === type;
                          return (
                            <Button
                              key={index}
                              onClick={() => handleTypeSelect(type)}
                              className={`rounded-none border bg-[#f5f5f5] text-[#333333] ${isSelected ? "border-[#171717]" : "border-transparent"}`}
                            >
                              {type}
                            </Button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {item.colors && item.colors.length > 0 && (
                    <>
                      <h3 className="mt-4">Màu sắc</h3>
                      <div className="flex">
                        {item.colors.map((color, index) => {
                          const isSelected = selectedColor === color;
                          return (
                            <Button
                              key={index}
                              onClick={() => handleColorSelect(color)}
                              className={`rounded-none border bg-[#f5f5f5] text-[#333333] ${isSelected ? "border-[#171717]" : "border-transparent"}`}
                            >
                              {color}
                            </Button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {item.sizes && item.sizes.length > 0 && (
                    <>
                      <h3 className="mt-4">Kích thước</h3>
                      <div className="flex">
                        {item.sizes.map((size, index) => {
                          const isSelected = selectedSize === size;
                          return (
                            <Button
                              key={index}
                              onClick={() => handleSizeSelected(size)}
                              className={`rounded-none border bg-[#f5f5f5] text-[#333333] ${isSelected ? "border-[#171717]" : "border-transparent"}`}
                            >
                              {size}
                            </Button>
                          );
                        })}
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
                    onClick={handleAddToCart}
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

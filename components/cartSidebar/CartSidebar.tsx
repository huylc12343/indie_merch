"use client";

import { useEffect, useMemo, useState } from "react";

import { X, Minus, Plus, Trash2, ChevronDown, Box, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

import Image from "next/image";

import { useRouter } from "next/navigation";
import { CartItem } from "@/lib/types";

export default function CartSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [openVariant, setOpenVariant] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  // load cart
  useEffect(() => {
    if (!open) return;

    const cart = localStorage.getItem("cart");

    if (cart) {
      const parsedCart: CartItem[] = JSON.parse(cart);

      setCartItems(parsedCart);

      // auto check all
      setSelectedItems(parsedCart.map((item) => item.cartKey));
    } else {
      setCartItems([]);
      setSelectedItems([]);
    }
  }, [open]);

  // save cart
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);

    localStorage.setItem("cart", JSON.stringify(items));
  };

  // increase
  const increaseQuantity = (cartKey: string) => {
    const updated = cartItems.map((item) =>
      item.cartKey === cartKey
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item,
    );

    saveCart(updated);
  };

  // decrease
  const decreaseQuantity = (cartKey: string) => {
    const updated = cartItems
      .map((item) =>
        item.cartKey === cartKey
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item,
      )
      .filter((item) => item.quantity > 0);

    saveCart(updated);
  };

  // remove
  const removeItem = (cartKey: string) => {
    const updated = cartItems.filter((item) => item.cartKey !== cartKey);

    saveCart(updated);

    setSelectedItems((prev) => prev.filter((i) => i !== cartKey));
  };
  const updateVariant = (
    cartKey: string,
    field: "selectedColor" | "selectedSize" | "selectedType",
    value: string,
  ) => {
    const currentIndex = cartItems.findIndex((i) => i.cartKey === cartKey);

    if (currentIndex === -1) return;

    const currentItem = cartItems[currentIndex];

    const updatedItem = {
      ...currentItem,
      [field]: value,
    };

    // regenerate cartKey
    const newCartKey = [
      updatedItem.id,
      updatedItem.selectedColor,
      updatedItem.selectedSize,
      updatedItem.selectedType,
    ].join("-");

    updatedItem.cartKey = newCartKey;

    // check existing same variant
    const existingIndex = cartItems.findIndex(
      (i) => i.cartKey === newCartKey && i.cartKey !== cartKey,
    );

    const updatedCart = [...cartItems];

    // nếu variant đã tồn tại -> merge quantity
    if (existingIndex !== -1) {
      updatedCart[existingIndex].quantity += updatedItem.quantity;

      updatedCart.splice(currentIndex, 1);
    } else {
      // giữ nguyên vị trí item
      updatedCart[currentIndex] = updatedItem;
    }

    saveCart(updatedCart);

    setOpenVariant(null);
  };
  const toggleSelectItem = (cartKey: string) => {
    setSelectedItems((prev) =>
      prev.includes(cartKey)
        ? prev.filter((i) => i !== cartKey)
        : [...prev, cartKey],
    );
  };
  // total
  const totalPrice = useMemo(() => {
    return cartItems
      .filter((item) => selectedItems.includes(item.cartKey))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems, selectedItems]);

  // checkout
  const handleCheckout = () => {
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.includes(item.cartKey),
    );

    // không có sản phẩm được chọn
    if (selectedCartItems.length === 0) return;

    localStorage.setItem("checkout_items", JSON.stringify(selectedCartItems));

    router.push("/check-out");
  };
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-white z-50 transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2>
              <span className="font-retroguard text-[28px]">GIỎ HÀNG</span>

              <span className="text-gray-400">
                {" "}
                {cartItems.length.toString().padStart(2, "0")}
              </span>
            </h2>

            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X />
            </Button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-6">
            {cartItems.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                Giỏ hàng đang trống
              </div>
            )}

            {cartItems.map((item) => (
              <div key={item.cartKey} className="flex gap-4 items-center">
                <button
                  onClick={() => toggleSelectItem(item.cartKey)}
                  className={`w-5 h-5 border flex items-center justify-center transition-all rounded-sm
    ${
      selectedItems.includes(item.cartKey)
        ? "bg-black border-black"
        : "border-gray-400 bg-white"
    }`}
                >
                  {selectedItems.includes(item.cartKey) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>
                <Image
                  src={item.image}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="object-cover"
                />

                <div className="flex-1">
                  <h4 className="font-medium text-2xl">{item.name}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[var(--color-primary-pink)] text-3xl font-normal ">
                      {new Intl.NumberFormat("vi-VN").format(item.price)} đ
                    </p>
                    {/* variants */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenVariant(
                            openVariant === item.cartKey ? null : item.cartKey,
                          )
                        }
                        className="border px-2 py-1 text-xs"
                      >
                        {[
                          item.selectedColor,
                          item.selectedSize,
                          item.selectedType,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                        <ChevronDown size={12} className="inline-block ml-1" />
                      </button>

                      {openVariant === item.cartKey && (
                        <div className="absolute right-0 z-50 mt-2 w-[345px] border  bg-white shadow-lg p-3">
                          <h1>Phân loại</h1>
                          {/* COLORS */}
                          {item.availableColors &&
                            item.availableColors.length > 0 && (
                              <div className="mb-3">
                                <div className="mb-1 text-xs font-semibold">
                                  Màu sắc
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {item.availableColors.map((color) => (
                                    <button
                                      key={color}
                                      onClick={() =>
                                        updateVariant(
                                          item.cartKey,
                                          "selectedColor",
                                          color,
                                        )
                                      }
                                      className={`border px-2 py-1 text-xs ${
                                        item.selectedColor === color
                                          ? "border-black"
                                          : "border-gray-200"
                                      }`}
                                    >
                                      {color}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* SIZES */}
                          {item.availableSizes &&
                            item.availableSizes.length > 0 && (
                              <div className="mb-3">
                                <div className="mb-1 text-xs font-semibold">
                                  Kích thước
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {item.availableSizes.map((size) => (
                                    <button
                                      key={size}
                                      onClick={() =>
                                        updateVariant(
                                          item.cartKey,
                                          "selectedSize",
                                          size,
                                        )
                                      }
                                      className={`border px-2 py-1 text-xs ${
                                        item.selectedSize === size
                                          ? "border-black"
                                          : "border-gray-200"
                                      }`}
                                    >
                                      {size}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* TYPES */}
                          {item.availableTypes &&
                            item.availableTypes.length > 0 && (
                              <div>
                                <div className="mb-1 text-xs font-semibold">
                                  Loại
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {item.availableTypes.map((type) => (
                                    <button
                                      key={type}
                                      onClick={() =>
                                        updateVariant(
                                          item.cartKey,
                                          "selectedType",
                                          type,
                                        )
                                      }
                                      className={`border px-2 py-1 text-xs ${
                                        item.selectedType === type
                                          ? "border-black"
                                          : "border-gray-200"
                                      }`}
                                    >
                                      {type}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2 rounded-md w-full">
                    {/* quantity */}
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        onClick={() => decreaseQuantity(item.cartKey)}
                        className="h-8 w-8 rounded-none border-[#171717] p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="flex h-8 w-8 items-center justify-center text-sm">
                        {item.quantity}
                      </span>

                      <Button
                        variant="outline"
                        onClick={() => increaseQuantity(item.cartKey)}
                        className="h-8 w-8 rounded-none border-[#171717] p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* remove */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.cartKey)}
                      className="rounded-none text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="flex items-center">
                <button
                  onClick={() => {
                    if (selectedItems.length === cartItems.length) {
                      setSelectedItems([]);
                    } else {
                      setSelectedItems(cartItems.map((i) => i.cartKey));
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`w-5 h-5 border flex items-center justify-center rounded-sm
                    ${
                      selectedItems.length === cartItems.length &&
                      cartItems.length > 0
                        ? "bg-black border-black"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedItems.length === cartItems.length &&
                      cartItems.length > 0 && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                  </div>

                  <span>Tất cả</span>
                </button>
              </span>

              <span className="text-[var(--color-primary-pink)] font-bold text-[28px] leading-[34px]">
                {new Intl.NumberFormat("vi-VN").format(totalPrice)} đ
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              className="w-full h-14 rounded-none bg-black text-white hover:bg-black/80"
            >
              THANH TOÁN
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

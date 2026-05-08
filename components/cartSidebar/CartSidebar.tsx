"use client";

import { useEffect, useMemo, useState } from "react";

import { X, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import Image from "next/image";

import { useRouter } from "next/navigation";

interface CartItem {
  cartKey: string;

  id: string;

  name: string;

  price: number;

  image: string;

  quantity: number;

  selectedColor?: string | null;

  selectedSize?: string | null;

  selectedType?: string | null;
}

export default function CartSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // load cart
  useEffect(() => {
    const cart = localStorage.getItem("cart");

    if (cart) {
      setCartItems(JSON.parse(cart));
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
  };

  // total
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }, [cartItems]);

  // checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    localStorage.setItem("checkout_items", JSON.stringify(cartItems));

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
        className={`fixed top-0 right-0 h-full w-[420px] bg-white z-50 transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-6">
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
              <div key={item.cartKey} className="flex gap-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="object-cover"
                />

                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>

                  {/* variants */}
                  <div className="text-xs text-gray-500 mt-1">
                    {item.selectedColor && <span>{item.selectedColor}</span>}

                    {item.selectedSize && <span> - {item.selectedSize}</span>}

                    {item.selectedType && <span> - {item.selectedType}</span>}
                  </div>

                  <p className="text-[var(--color-primary-pink)] font-bold mt-2">
                    {new Intl.NumberFormat("vi-VN").format(item.price)} đ
                  </p>

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
              <span>Tổng cộng</span>

              <span className="text-[var(--color-primary-pink)] font-bold text-[28px] leading-[34px]">
                {new Intl.NumberFormat("vi-VN").format(totalPrice)} đ
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
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

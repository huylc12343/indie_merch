"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import favicon from "@/app/favicon.png";
import CartSidebar from "@/components/cartSidebar/CartSidebar";
import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  const [openCart, setOpenCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const cart = localStorage.getItem("cart");
      if (cart) {
        const parsed = JSON.parse(cart);
        const total = parsed.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0,
        );
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    };

    updateCount();
    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, [openCart]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 w-full  z-50 overflow-x-hidden">
        <nav className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:p-6 bg-white bg-white/70 backdrop-blur-xl shadow-md backdrop-blur-md">
          {/* Logo */}
          <Link href="https://indiindishow.com" className="shrink-0">
            <Image
              src={favicon}
              alt="logo"
              width={132}
              height={65}
              className="w-[88px] h-auto sm:w-[110px] md:w-[132px]"
            />
          </Link>

          {/* Cart */}
          <div className="shrink-0 flex items-center">
            {/* Desktop */}
            <Button
              className="hidden md:flex px-6 py-4 bg-[#171717] text-white font-semibold text-base leading-6 hover:bg-black/80 cursor-pointer rounded-none h-auto gap-2"
              onClick={() => setOpenCart(true)}
            >
              GIỎ HÀNG
              {cartCount > 0 && (
                <span className="bg-[var(--color-primary-pink)] text-white text-xs font-bold rounded-none w-5 h-5 flex items-center justify-center md:hidden">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Button>

            {/* Mobile */}
            <button
              className="md:hidden relative p-2 cursor-pointer"
              onClick={() => setOpenCart(true)}
              aria-label="Mở giỏ hàng"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[var(--color-primary-pink)] text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 leading-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>
      <CartSidebar open={openCart} setOpen={setOpenCart} />
    </>
  );
}

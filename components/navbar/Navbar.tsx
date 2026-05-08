"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import favicon from "@/app/favicon.png";
import CartSidebar from "@/components/cartSidebar/CartSidebar";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
export default function Navbar() {
  const [openCart, setOpenCart] = useState(false);
  return (
    <div className="fixed top-0 left-0 w-full z-50   ">
      <nav className="flex flex-row items-center justify-between p-6 bg-white text-black bg-white/10 backdrop-blur-md shadow-md  ">
        <div className="nav-item">
          <Link href={"/"}>
            <Image src={favicon} alt="logo" width={132} height={65} />
          </Link>
        </div>

        <div className="nav-item flex items-center">
          {/* Button chỉ hiện trên máy tính */}
          <Button
            className="hidden md:flex px-6 py-4 bg-[#171717] text-white font-semibold text-base leading-6 tracking-normal hover:bg-black/80 hover:cursor-pointer rounded-none h-auto"
            style={{ fontFamily: "sans-serif" }}
            onClick={() => setOpenCart(true)}
          >
            GIỎ HÀNG
          </Button>

          {/* Icon chỉ hiện trên điện thoại */}
          <ShoppingCart
            className="md:hidden cursor-pointer"
            size={24}
            onClick={() => setOpenCart(true)}
          />
        </div>
      </nav>
        <CartSidebar open={openCart} setOpen={setOpenCart} />
    </div>
  );
}

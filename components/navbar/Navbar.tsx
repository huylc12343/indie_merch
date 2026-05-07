"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import favicon from "@/app/favicon.png";
import CartSidebar from "@/components/cartSidebar/CartSidebar";
import { useState } from "react";
export default function Navbar() {
    const [openCart, setOpenCart] = useState(false);
  return (
    <nav className="flex flex-row items-center justify-between p-6 bg-white text-black">
      <div className="nav-item">
        <Link href={"/"}>
          <Image src={favicon} alt="logo" width={132} height={65} />
        </Link>
      </div>
      <div className="nav-item">
        <div className="nav-item">
          <Button
            
            className="px-6 py-4 bg-[#171717] text-white font-semibold text-base leading-6 tracking-normal hover:bg-black/80  rounded-none h-auto"
            style={{ fontFamily: "sans-serif" }}
            onClick={()=>setOpenCart(true)}
          >
            GIỎ HÀNG
          </Button>
        </div>
      </div>
      <CartSidebar open={openCart} setOpen={setOpenCart} />
    </nav>
  );
}

"use client";
import Link from "next/link";
import Image from "next/image";
import whiteFavicon from "@/app/white_favicon.png";

import { useState } from "react";
export default function Navbar() {
  const [openCart, setOpenCart] = useState(false);
  return (
    <div className="fixed top-0 left-0 w-full z-50  ">
      <nav className="flex items-center justify-between px-4 py-3 md:p-6 bg-[#333333]/10 backdrop-blur-md shadow-md">
        <Link href={"https://indiindishow.com"}>
          <Image
            src={whiteFavicon}
            alt="logo"
            width={132}
            height={65}
            className="w-[90px] md:w-[132px] h-auto"
          />
        </Link>
      </nav>
    </div>
  );
}

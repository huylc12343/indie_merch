"use client";
import Link from "next/link";
import Image from "next/image";
import whiteFavicon from "@/app/white_favicon.png";

import { useState } from "react";
export default function Navbar() {
  const [openCart, setOpenCart] = useState(false);
  return (
    <nav className="flex flex-row items-center justify-between p-6 bg-[#333333]">
      <div className="nav-item ml-30">
        <Link href={"/"}>
          <Image src={whiteFavicon} alt="logo" width={132} height={65} />
        </Link>
      </div>
    </nav>
  );
}

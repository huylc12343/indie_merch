"use client";

import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import sample from "@/app/img_sample.png"
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: any;
}

const mockData: CartItem[] = [
  {
    id: 1,
    name: "Khăn gấp gấp",
    price: 179000,
    image: sample,
  },
  {
    id: 2,
    name: "Khăn tự do",
    price: 199000,
    image: sample,
  },
];

export default function CartSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
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
            <h2 >
              <span className="font-retroguard text-[28px]">GIỎ HÀNG </span><span className="text-gray-400"> 02</span>
            </h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X />
            </Button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-6">
            {mockData.map((item) => (
              <div key={item.id} className="flex gap-4">
                {/* Checkbox */}
                <input type="checkbox" defaultChecked />

                {/* Image */}
                <Image
                  src={item.image}
                  alt=""
                  width={120}
                  height={120}                  
                />

                {/* Info */}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-[var(--color-primary-pink)] font-bold">
                    {new Intl.NumberFormat("vi-VN").format(item.price)} đ
                  </p>

                  <div className="flex items-center justify-between gap-4 py-2 rounded-md w-full">
                    {/* Left */}
                    <div className="flex items-center">
                      {/* Minus */}
                      <Button
                        variant="outline"
                        className="h-8 w-8 rounded-none border-[#171717] p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      {/* Quantity */}
                      <span className="flex h-8 w-8 items-center justify-center text-sm">
                        1
                      </span>

                      {/* Plus */}
                      <Button
                        variant="outline"
                        className="h-8 w-8 rounded-none border-[#171717] p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
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
              <span>
                <input type="checkbox" defaultChecked className="mr-2 text-[16px] leading-6 " />
                Tất cả
              </span>
              <span className="text-[var(--color-primary-pink)] font-bold text-[28px] leading-[34px]">
                378.000 đ
              </span>
            </div>

            <Button className="w-full h-14 rounded-none bg-black text-white hover:bg-black/80">
              THANH TOÁN
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

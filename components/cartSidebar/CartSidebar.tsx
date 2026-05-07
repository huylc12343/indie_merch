"use client";

import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

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
    image: "/sample.png",
  },
  {
    id: 2,
    name: "Khăn tự do",
    price: 199000,
    image: "/sample.png",
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
            <h2 className="font-bold text-lg">
              GIỎ HÀNG <span className="text-gray-400">02</span>
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
                  width={60}
                  height={60}
                  className="rounded-md"
                />

                {/* Info */}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-[var(--color-primary-pink)] font-bold">
                    {new Intl.NumberFormat("vi-VN").format(item.price)} đ
                  </p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" className="w-6 h-6 p-0">
                      <Minus className="w-3 h-3" />
                    </Button>

                    <span className="text-sm">01</span>

                    <Button variant="outline" className="w-6 h-6 p-0">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Delete */}
                <button className="text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-4 text-sm">
              <span>
                <input type="checkbox" defaultChecked className="mr-2" />
                Tất cả
              </span>
              <span className="text-[var(--color-primary-pink)] font-bold text-lg">
                378.000 đ
              </span>
            </div>

            <Button className="w-full bg-black text-white hover:bg-black/80">
              THANH TOÁN
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

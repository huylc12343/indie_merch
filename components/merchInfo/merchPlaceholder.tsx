"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const placeholderImage =
  "https://static.vecteezy.com/system/resources/previews/015/277/489/large_2x/can-not-load-corrupted-image-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg";

export default function MerchPlaceholder() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="merch-item block w-full cursor-pointer text-left"
      >
        <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-neutral-100">
          <img
            src={placeholderImage}
            alt="Minh họa ảnh không tải được"
            width={630}
            height={630}
            className="h-full w-full object-contain p-4"
          />
          <span className="absolute right-3 top-3 border border-[#FF017E] bg-white px-2 py-1 text-xs font-bold leading-none tracking-wide text-[#FF017E]">
            SOLD OUT
          </span>
        </span>
        <span className="block pt-3 text-2xl leading-8">
          <span className="block font-semibold">
            Sản phẩm đang được cập nhật
          </span>
          <span className="mt-1 block text-base font-normal text-neutral-600">
            Nội dung sẽ hiển thị khi có dữ liệu.
          </span>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 lg:items-center lg:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="merch-placeholder-title"
            className="relative flex max-h-[90vh] w-full max-w-[1000px] flex-col gap-6 overflow-y-auto bg-white p-4 pb-6 lg:max-h-[80vh] lg:flex-row lg:gap-8 lg:p-8"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Đóng popup"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10"
            >
              <X />
            </Button>

            <div className="w-full lg:max-w-[452px] lg:flex-1">
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-neutral-100">
                <img
                  src={placeholderImage}
                  alt="Minh họa ảnh không tải được"
                  width={630}
                  height={630}
                  className="h-full w-full object-contain p-4"
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-8 pt-2 lg:pt-12">
              <div>
                <h2
                  id="merch-placeholder-title"
                  className="font-retroguard text-3xl leading-tight md:text-5xl"
                >
                  Sản phẩm đang được cập nhật
                </h2>
                <p className="mt-4 text-lg leading-7 text-neutral-600">
                  Thông tin chi tiết sẽ hiển thị khi sản phẩm có dữ liệu.
                </p>
              </div>

              <Button
                type="button"
                disabled
                className="h-12 w-full cursor-not-allowed rounded-none bg-neutral-400 text-base font-bold text-white opacity-100 hover:bg-neutral-400 disabled:opacity-100"
              >
                SOLD OUT
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

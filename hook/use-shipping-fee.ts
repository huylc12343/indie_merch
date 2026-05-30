import { useState, useCallback, useRef, useEffect } from "react";
import { calculateShippingFee } from "@/lib/api";

export function useShippingFee() {
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null); // ✅ thêm

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef(0);

  const calculateFee = useCallback((address: string, subtotal: number) => {
    if (!address.trim() || address.trim().length < 15 || subtotal <= 0) {
      setShippingFee(0);
      setShippingError(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const callId = Date.now();
      lastCallRef.current = callId;

      setIsCalculating(true);
      setShippingError(null); // ✅ reset lỗi mỗi lần tính

      try {
        const data = await calculateShippingFee(address, subtotal);

        if (lastCallRef.current !== callId) return;

        if (typeof data.shipping_fee === "number") {
          setShippingFee(data.shipping_fee);
        } else {
          setShippingFee(0);
          setShippingError("Không tính được phí vận chuyển"); // ✅
        }
      } catch (error: any) {
        if (lastCallRef.current !== callId) return;
        setShippingFee(0);

        // ✅ phân loại lỗi
        if (error.message === "No shipping result") {
          setShippingError("Địa chỉ không hợp lệ hoặc không hỗ trợ giao hàng");
        } else {
          setShippingError("Không tính được phí vận chuyển");
        }
      } finally {
        setIsCalculating(false);
      }
    }, 800);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { shippingFee, isCalculating, calculateFee, shippingError }; // ✅ export thêm
}
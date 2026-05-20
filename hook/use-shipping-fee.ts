import { useState, useCallback, useRef, useEffect } from "react";
import { calculateShippingFee } from "@/lib/api";

export function useShippingFee() {
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef(0);

  const calculateFee = useCallback((address: string, subtotal: number) => {
    // ❌ Không đủ điều kiện → reset
    if (!address.trim() || address.trim().length < 15 || subtotal <= 0) {
      setShippingFee(0);
      return;
    }

    // debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      const callId = Date.now();
      lastCallRef.current = callId;

      setIsCalculating(true);

      try {
        const data = await calculateShippingFee(address, subtotal);

        if (typeof data.shipping_fee === "number") {
          setShippingFee(data.shipping_fee);
        }

        // ❗ chống race condition
        if (lastCallRef.current !== callId) return;

        if (typeof data.shipping_fee === "number") {
          setShippingFee(data.shipping_fee);
        } else {
          setShippingFee(0);
        }
      } catch (error) {
        console.error("Shipping Fee Error:", error);
        setShippingFee(0);
      } finally {
        setIsCalculating(false);
      }
    }, 800);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    shippingFee,
    isCalculating,
    calculateFee,
  };
}

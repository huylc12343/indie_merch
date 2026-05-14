import { useState, useCallback, useRef, useEffect } from "react";
import { calculateShippingFee } from "@/lib/api";

export function useShippingFee() {
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const calculateFee = useCallback(
    (address: string, totalPrice: number) => {
      if (!address.trim() || address.trim().length < 10) {
        setShippingFee(0);
        return;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setIsCalculating(true);

        try {
          const data = await calculateShippingFee(
            address,
            totalPrice,
          );

          const fee = data?.data?.fee;

          if (typeof fee === "number") {
            setShippingFee(fee);
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
    },
    [],
  );

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
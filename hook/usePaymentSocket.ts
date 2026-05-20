// hooks/usePaymentSocket.ts
"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

export function usePaymentSocket(orderId?: string, onSuccess?: (order: any) => void) {
  useEffect(() => {
    if (!orderId) return;

    const socket = io(process.env.NEXT_PUBLIC_BE_URL!, {
      transports: ["websocket"],
    });

    // join room
    socket.emit("join_order", { order_id: orderId });

    // listen success
    socket.on("payment_success", (data) => {
      console.log("✅ PAYMENT SUCCESS:", data);

      if (data.order_id === orderId) {
        onSuccess?.(data.order);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, onSuccess]);
}
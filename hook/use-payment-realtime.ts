"use client";

import { useCallback, useEffect, useRef } from "react";

import type { CreateMerchOrderResponse } from "@/lib/api";
import { ORDER_STATUS } from "@/lib/types";

type UsePaymentRealtimeOptions = {
  enabled: boolean;
  orderId?: string;

  getOrder: (
    orderId: string,
  ) => Promise<CreateMerchOrderResponse>;

  onSuccess: (
    order: CreateMerchOrderResponse,
  ) => void;

  onExpired: () => void;

  pollingInterval?: number;
};

export function usePaymentRealtime({
  enabled,
  orderId,
  getOrder,
  onSuccess,
  onExpired,
  pollingInterval = 5000,
}: UsePaymentRealtimeOptions) {
  const intervalRef = useRef<number | null>(null);

  const resolvedRef = useRef(false);

  const stopTracking = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);

      intervalRef.current = null;
    }
  }, []);

  const resolveSuccess = useCallback(
    (order: CreateMerchOrderResponse) => {
      if (resolvedRef.current) return;

      resolvedRef.current = true;

      stopTracking();

      onSuccess(order);
    },
    [onSuccess, stopTracking],
  );

  const resolveExpired = useCallback(() => {
    if (resolvedRef.current) return;

    resolvedRef.current = true;

    stopTracking();

    onExpired();
  }, [onExpired, stopTracking]);

  const applyOrderStatus = useCallback(
    (order: CreateMerchOrderResponse) => {
      switch (order.status) {
        case ORDER_STATUS.IN_PROGRESS:
        case ORDER_STATUS.DONE:
          resolveSuccess(order);
          break;

        case ORDER_STATUS.CANCEL:
        case ORDER_STATUS.DROP:
          resolveExpired();
          break;

        default:
          break;
      }
    },
    [resolveExpired, resolveSuccess],
  );

  const checkOrderStatus = useCallback(
    async (finalCheck = false) => {
      if (!orderId) return;

      try {
        const latestOrder = await getOrder(orderId);

        applyOrderStatus(latestOrder);

        if (
          finalCheck &&
          latestOrder.status !== ORDER_STATUS.IN_PROGRESS &&
          latestOrder.status !== ORDER_STATUS.DONE
        ) {
          resolveExpired();
        }
      } catch (error) {
        console.error("Check payment failed:", error);

        if (finalCheck) {
          resolveExpired();
        }
      }
    },
    [
      applyOrderStatus,
      getOrder,
      orderId,
      resolveExpired,
    ],
  );

  const handleDeadlineReached = useCallback(() => {
    void checkOrderStatus(true);
  }, [checkOrderStatus]);

  useEffect(() => {
    resolvedRef.current = false;

    stopTracking();

    if (!enabled || !orderId) {
      return;
    }

    void checkOrderStatus();

    intervalRef.current = window.setInterval(() => {
      void checkOrderStatus();
    }, pollingInterval);

    return () => {
      stopTracking();
    };
  }, [
    enabled,
    orderId,
    pollingInterval,
    checkOrderStatus,
    stopTracking,
  ]);

  return {
    stopTracking,
    handleDeadlineReached,
  };
}
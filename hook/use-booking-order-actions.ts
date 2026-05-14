// hook/use-merch-order-actions.ts
import { useCallback, useMemo, useState } from "react";

import { checkDiscountCode } from "@/lib/api";
import type { DiscountCodeOutput } from "@/lib/schema";
import { validateEmail, validatePhone } from "@/lib/schema";
import { CartItem, DISCOUNT_CODE_TYPE, PAYMENT_METHOD } from "@/lib/types";
import type { CreateMerchOrderResponse } from "@/lib/api";
import {
  createMerchOrder,
  type CreateMerchOrderPayload,
  fetchBanks,
} from "@/lib/api";
type UseMerchOrderActionsOptions = {
  cartItems: CartItem[];
  discountCode: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  shippingFee: number;
  subtotal: number;
  showErrorToast: (message: string) => void;
  onOrderCreated: () => void;
};

export function useMerchOrderActions({
  cartItems,
  discountCode,
  fullName,
  phone,
  email,
  address,
  shippingFee,
  subtotal,
  showErrorToast,
  onOrderCreated,
}: UseMerchOrderActionsOptions) {
  const [appliedDiscount, setAppliedDiscount] =
    useState<DiscountCodeOutput | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] =
    useState<CreateMerchOrderResponse | null>(null);
  const updateCreatedOrder = useCallback((order: CreateMerchOrderResponse) => {
    setCreatedOrder(order);
  }, []);

  const [paymentBankName, setPaymentBankName] = useState<string | null>(null);
  const resolvedDiscountCodeAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    return appliedDiscount.type === DISCOUNT_CODE_TYPE.PERCENTAGE
      ? Math.ceil((subtotal * appliedDiscount.value) / 100)
      : appliedDiscount.value;
  }, [appliedDiscount, subtotal]);

  const computedTotal = useMemo(
    () => Math.max(0, subtotal + shippingFee - resolvedDiscountCodeAmount),
    [subtotal, shippingFee, resolvedDiscountCodeAmount],
  );

  const handleApplyDiscount = useCallback(async () => {
    setIsApplyingDiscount(true);
    try {
      const found = await checkDiscountCode(discountCode);
      if (!found) {
        showErrorToast("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        return;
      }
      if (subtotal < found.min_order_value) {
        showErrorToast(
          `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN").format(found.min_order_value)} đ để áp dụng mã này.`,
        );
        return;
      }
      if (found.max_uses !== null && found.used_count >= found.max_uses) {
        showErrorToast("Mã giảm giá đã hết lượt sử dụng.");
        return;
      }
      setAppliedDiscount(found);
    } catch {
      showErrorToast("Không thể kiểm tra mã giảm giá, vui lòng thử lại.");
    } finally {
      setIsApplyingDiscount(false);
    }
  }, [discountCode, showErrorToast, subtotal]);

  const handleClearDiscount = useCallback(() => {
    setAppliedDiscount(null);
  }, []);

  const handleCreateOrder = useCallback(async () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedAddress = address.trim();
    if (!trimmedName) {
      showErrorToast("Vui lòng điền đủ thông tin.");
      return;
    }
    if (!validatePhone(trimmedPhone).success) {
      showErrorToast("Số điện thoại không hợp lệ.");
      return;
    }
    if (!validateEmail(trimmedEmail).success) {
      showErrorToast("Email không hợp lệ.");
      return;
    }
    if (cartItems.length === 0) {
      showErrorToast("Giỏ hàng trống.");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const orderItemSubtotal = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      const payload: CreateMerchOrderPayload = {
        customer_name: trimmedName,

        customer_phone: trimmedPhone,

        customer_email: trimmedEmail,

        customer_address: trimmedAddress,

        payment_method: PAYMENT_METHOD.BANK_TRANSFER,

        subtotal: orderItemSubtotal,

        discount_combo: 0,

        discount_code_id: appliedDiscount?.id,

        discount_code_amount: resolvedDiscountCodeAmount,
        shipping_fee: shippingFee, // ← thêm dòng này

        total: computedTotal,

        order_items: cartItems.map((item) => ({
          merch_id: item.id,

          quantity: item.quantity,

          unit_price: item.price,

          subtotal: item.price * item.quantity,
        })),
      };
      const [order, bankLookupResult] = await Promise.all([
        createMerchOrder(payload),
        fetchBanks().catch(() => null),
      ]);

      const matchedBank = bankLookupResult?.data?.find(
        (bank) => bank.bin === order.payment_info.bin,
      );

      setCreatedOrder(order);

      setPaymentBankName(matchedBank?.name ?? order.payment_info.bin);

      onOrderCreated();
    } catch {
      showErrorToast("Không thể tạo đơn hàng, vui lòng thử lại.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [
    cartItems,
    fullName,
    phone,
    email,
    address,
    computedTotal,
    appliedDiscount,
    onOrderCreated,
    showErrorToast,
    resolvedDiscountCodeAmount,
    shippingFee,
    subtotal,
  ]);

  return {
    appliedDiscount,
    handleApplyDiscount,
    handleClearDiscount,
    handleCreateOrder,
    isApplyingDiscount,
    isSubmittingOrder,
    computedTotal,
    resolvedDiscountCodeAmount,

    createdOrder,
    updateCreatedOrder,
    paymentBankName,
  };
}

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
import { trim } from "valibot";
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
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
  }>({});
  const [appliedDiscount, setAppliedDiscount] =
    useState<DiscountCodeOutput | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] =
    useState<CreateMerchOrderResponse | null>(null);
  const updateCreatedOrder = useCallback((order: CreateMerchOrderResponse) => {
    setCreatedOrder(order);
  }, []);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [paymentBankName, setPaymentBankName] = useState<string | null>(null);
  const resolvedDiscountCodeAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    return appliedDiscount.type === DISCOUNT_CODE_TYPE.PERCENTAGE
      ? Math.ceil((subtotal * appliedDiscount.value) / 100)
      : appliedDiscount.value;
  }, [appliedDiscount, subtotal]);

  const computedTotal = Math.max(
    0,
    subtotal + shippingFee - resolvedDiscountCodeAmount,
  );

  const handleApplyDiscount = useCallback(async () => {
    setIsApplyingDiscount(true);
    setDiscountError(null); // reset mỗi lần thử
    try {
      const found = await checkDiscountCode(discountCode);
      if (!found) {
        setDiscountError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        return;
      }
      if (subtotal < found.min_order_value) {
        setDiscountError(
          `Chỉ áp dụng cho đơn hàng từ ${new Intl.NumberFormat("vi-VN").format(found.min_order_value)}đ trở lên.`,
        );
        setIsApplyingDiscount(false);
        return;
      }
      if (found.max_uses !== null && found.used_count >= found.max_uses) {
        setDiscountError("Mã giảm giá đã hết lượt sử dụng.");
        return;
      }
      setAppliedDiscount(found);
    } catch {
      setDiscountError("Không thể kiểm tra mã giảm giá, vui lòng thử lại.");
    } finally {
      setIsApplyingDiscount(false);
    }
  }, [discountCode, subtotal]);

  const handleClearDiscount = useCallback(() => {
    setAppliedDiscount(null);
    setDiscountError(null); // xóa lỗi khi clear
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
        discount_code: appliedDiscount?.code || "",
        discount_code_id: appliedDiscount?.code ?? "", // ✅ đổi từ discount_code_id

        discount_code_amount: resolvedDiscountCodeAmount,
        shipping_fee: shippingFee, // ← thêm dòng này

        total: computedTotal,

        order_items: cartItems.map((item) => ({
          merch_id: item.id,
          merch_name: item.name, // ✅ thêm dòng này
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          subtotal: Number(item.price) * Number(item.quantity),
          selected_type: item.selectedType ?? null, // thêm
          selected_color: item.selectedColor ?? null, // thêm
          selected_size: item.selectedSize ?? null, // thêm
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
  const validateForm = useCallback(() => {
    const newErrors: typeof errors = {};

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }
    if (!trimmedPhone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!validatePhone(trimmedPhone).success) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (!trimmedEmail) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(trimmedEmail).success) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!trimmedAddress) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    // if (shippingMethod === "delivery" && !trimmedAddress) {
    //   newErrors.address = "Vui lòng nhập địa chỉ";
    // }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [fullName, phone, email, address /*shippingMethod*/]);

  return {
    appliedDiscount,
    handleApplyDiscount,
    handleClearDiscount,
    handleCreateOrder,
    isApplyingDiscount,
    isSubmittingOrder,
    computedTotal,
    resolvedDiscountCodeAmount,
    validateForm,
    errors,
    setShippingError,
    createdOrder,
    updateCreatedOrder,
    paymentBankName,
    discountError,
  };
}

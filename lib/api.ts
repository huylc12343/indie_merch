import { parse } from "valibot";
import { DEMO_MODE, createMockOrder, getMockDiscount, getMockOrder, settleMockOrder } from "./mock-store";
import {
  merchOrderSchema,
  discountCodeSchema,
  type DiscountCodeOutput,
} from "@/lib/schema";
import {
  ORDER_STATUS,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/types";

export async function checkDiscountCode(
  code: string,
): Promise<DiscountCodeOutput | null> {
  if (DEMO_MODE) return getMockDiscount(code);
  const trimmedCode = code.trim().toLowerCase();
  if (!trimmedCode) return null;

  const response = await fetch(
    `/api/discounts/validate?code=${encodeURIComponent(trimmedCode)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Failed to check discount code: HTTP ${response.status}`);
  }

  const payload = await response.json();

  if (!payload.data) return null;

  return parse(discountCodeSchema, payload.data);
}
export type CreateOrderResponse = {
  id: string;

  event_id: string;

  payment_info: {
    account_name: string;
    account_number: string;
    amount: number;
    bin: string;
    description: string;
    qr_code: string;
  };

  expires_at: string | null;
};
export type CreateMerchOrderResponse = {
  id: string;
  order_code?: string;
  status: OrderStatus;
  subtotal?: number;
  shipping_fee?: number;
  discount_code_amount?: number;
  total?: number;
  order_items?: Array<{
    merch_id: string;
    unit_price: number;
    quantity: number;
    selected_color?: string | null;
    selected_size?: string | null;
    selected_type?: string | null;
    image?: string;
  }>;
  payment_info: {
    account_name: string;
    account_number: string;
    amount: number;
    bin: string;
    description: string;
    qr_code: string;
  };
  expires_at: string | null;
};
type CreateOrderItemPayload = {
  ticket_type_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};
type CreateMerchOrderItemPayload = {
  merch_id: string;
  merch_name: string; // ✅ thêm dòng này
  quantity: number;
  unit_price: number;
  subtotal: number;
  selected_type?: string | null; // thêm
  selected_color?: string | null; // thêm
  selected_size?: string | null; // thêm
};
export type BankLookupResponse = {
  data?: Array<{
    bin: string;
    name: string;
    shortName: string;
  }>;
};
export type CreateOrderPayload = {
  event_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  payment_method?: PaymentMethod;
  subtotal: number;
  discount_combo: number;
  discount_code_id?: string;
  discount_code_amount: number;
  total: number;
  order_items: [CreateOrderItemPayload];
};
export type CreateMerchOrderPayload = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address?: string;
  shipping_method?: "pickup_store" | "pickup_event" | "delivery";
  payment_method?: PaymentMethod;
  subtotal: number;
  discount_combo: number;
  discount_code?: string;
  discount_code_id?: string;
  discount_code_amount: number;
  shipping_fee: number;

  total: number;
  order_items: CreateMerchOrderItemPayload[];
};

export async function createOrder(
  body: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const id = crypto.randomUUID();

  return {
    id,
    event_id: body.event_id,
    payment_info: {
      account_name: "INDI MERCH DEMO",
      account_number: "DEMO-0000",
      amount: body.total,
      bin: "DEMO",
      description: `THANHTOAN ${Date.now()}`,
      qr_code: `indie-merch://demo-payment?order_id=${id}`,
    },
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}
export async function createMerchOrder(
  body: CreateMerchOrderPayload,
): Promise<CreateMerchOrderResponse> {
  if (DEMO_MODE) return createMockOrder(body);
  const response = await fetch(`/api/orders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Create order failed: HTTP ${response.status}`);
  }

  const data = await response.json();

  // backend đã return trực tiếp order
  return data;
}

// async function createMerchInDirectus(body: CreateMerchOrderPayload) {
//   // ❌ Bỏ: await new Promise((resolve) => setTimeout(resolve, 1000));

//   const response = await fetch(`/api/orders/create`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to create merch order: HTTP ${response.status}`);
//   }

//   const orderResponse = (await response.json()) as CreateMerchOrderResponse;

//   return {
//     customer: {
//       name: body.customer_name,
//       phone: body.customer_phone,
//       email: body.customer_email,
//       address: body.customer_address,
//     },
//     order_items: body.order_items,
//     subtotal: body.subtotal,
//     shipping_fee: body.shipping_fee,
//     total: body.total,
//     order: orderResponse,
//   };
// }
export async function fetchBanks(): Promise<BankLookupResponse> {
  const response = await fetch("/api/banks");

  if (!response.ok) {
    throw new Error(`Failed to fetch banks: HTTP ${response.status}`);
  }

  return (await response.json()) as BankLookupResponse;
}
// lib/api.ts
export async function getMerchOrder(
  orderId: string,
): Promise<CreateMerchOrderResponse> {
  if (DEMO_MODE) return getMockOrder(orderId);
  const response = await fetch(`/api/orders/${orderId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order: HTTP ${response.status}`);
  }

  // Bỏ parse(merchOrderSchema, ...) vì backend trả về dạng rút gọn
  return (await response.json()) as CreateMerchOrderResponse;
}
export async function getOrderById(
  orderId: string,
): Promise<CreateMerchOrderResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BE_URL is not configured");
  }

  const response = await fetch(`${baseUrl}/orders/${orderId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as CreateMerchOrderResponse;
  return parse(merchOrderSchema, payload);
}
// export type ShippingFeeResponse = {
//   data: {
//     fee: number;
//     service: string;
//     serviceCode: string;
//   };
// };

export type ShippingFeeResponse = {
  shipping_fee: number;
};

export async function calculateShippingFee(
  address: string,
  subtotal: number,
): Promise<{ shipping_fee: number }> {
  if (DEMO_MODE) {
    if (!address.trim()) throw new Error("Vui lòng nhập địa chỉ nhận hàng.");
    return { shipping_fee: 30000 };
  }
  const response = await fetch("/api/shipping/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
      subtotal,
    }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Không tính được phí vận chuyển");
  }
  return data;
}

export async function confirmPayment(orderId: string, transferContent: string) {
  const res = await fetch("/api/orders/confirm-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order_id: orderId,
      transfer_content: transferContent,
    }),
  });

  if (!res.ok) {
    throw new Error("Confirm payment failed");
  }

  return res.json();
}

export async function simulateMerchPayment(orderId: string) {
  if (DEMO_MODE) return settleMockOrder(orderId);
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/simulate-payment`, { method: "POST" });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Không thể hoàn tất thanh toán mô phỏng.");
  }
  return response.json();
}

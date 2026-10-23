import { localMerch } from "./localMerch";
import type { CreateMerchOrderPayload, CreateMerchOrderResponse } from "./api";
import type { DiscountCodeOutput } from "./schema";
import type { MerchItem } from "./types";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const STORE_KEY = "indie-merch-demo-v1";
const SESSION_KEY = "indie-merch-demo-admin";

type Product = {
  id: string; name: string; price: number; description: string;
  stock_quantity: number; reserved_quantity: number; active: boolean;
  colors: string[]; sizes: string[]; types: string[]; images: string[];
  color_images: Record<string, string>;
};
type Item = NonNullable<CreateMerchOrderResponse["order_items"]>[number] & { merch_name: string };
type Order = CreateMerchOrderResponse & {
  customer_name: string; customer_phone: string; customer_email: string;
  customer_address: string; created_at: string; items: Item[];
};
type Store = { products: Product[]; orders: Order[] };

function save(store: Store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function load(): Store {
  const stored = localStorage.getItem(STORE_KEY);
  const store: Store = stored ? JSON.parse(stored) : {
    products: localMerch.map((item) => ({
      id: item.id, name: item.name, price: item.price, description: item.description ?? "",
      stock_quantity: 100, reserved_quantity: 0, active: true,
      colors: item.colors ?? [], sizes: item.sizes ?? [], types: item.types ?? [],
      images: (item.merch_images ?? []).map((image) => image.directus_files_id.id),
      color_images: item.colorImages ?? {},
    })),
    orders: [],
  };
  for (const order of store.orders) {
    if (order.status === "init" && order.expires_at && Date.parse(order.expires_at) <= Date.now()) {
      transition(store, order, "drop");
    }
  }
  save(store);
  return store;
}

function transition(store: Store, order: Order, status: "done" | "cancel" | "drop") {
  if (order.status === status) return;
  if (order.status !== "init" && order.status !== "in_progress") throw new Error("Đơn đã kết thúc.");
  for (const item of order.items) {
    const product = store.products.find((product) => product.id === item.merch_id);
    if (!product) continue;
    product.reserved_quantity -= item.quantity;
    if (status === "done") product.stock_quantity -= item.quantity;
  }
  order.status = status;
}

export function getMockCatalog(): MerchItem[] {
  return load().products.filter((product) => product.active).map((product) => ({
    id: product.id, name: product.name, price: product.price, description: product.description,
    quantity: product.stock_quantity - product.reserved_quantity,
    soldOut: product.stock_quantity <= product.reserved_quantity,
    colors: product.colors, sizes: product.sizes, types: product.types,
    colorImages: product.color_images,
    merch_images: product.images.map((id) => ({ directus_files_id: { id } })),
  }));
}

export function getMockDiscount(code: string): DiscountCodeOutput | null {
  if (code.trim().toUpperCase() !== "INDI10") return null;
  return {
    id: "11111111-1111-4111-8111-111111111111", code: "INDI10", type: "percentage",
    value: 10, min_order_value: 0, max_uses: null, used_count: 0,
    expires_at: null, status: "active", date_created: new Date().toISOString(),
    date_updated: null, event_id: null,
  };
}

export function createMockOrder(body: CreateMerchOrderPayload): Order {
  const store = load();
  if (!body.customer_name.trim() || !body.customer_phone.trim() || !body.customer_email.trim()) {
    throw new Error("Vui lòng điền đủ thông tin khách hàng.");
  }
  if (!body.order_items.length) throw new Error("Giỏ hàng trống.");
  if (body.shipping_method === "delivery" && !body.customer_address?.trim()) throw new Error("Vui lòng nhập địa chỉ nhận hàng.");
  const needed = new Map<string, number>();
  const items: Item[] = body.order_items.map((item) => {
    const product = store.products.find((product) => product.id === item.merch_id && product.active);
    if (!product || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 40) {
      throw new Error("Sản phẩm hoặc số lượng không hợp lệ.");
    }
    for (const [selected, options] of [[item.selected_color, product.colors], [item.selected_size, product.sizes], [item.selected_type, product.types]] as const) {
      if (options.length && (!selected || !options.includes(selected))) throw new Error("Vui lòng chọn phân loại sản phẩm hợp lệ.");
    }
    needed.set(product.id, (needed.get(product.id) ?? 0) + item.quantity);
    return {
      merch_id: product.id, merch_name: product.name, quantity: item.quantity, unit_price: product.price,
      selected_color: item.selected_color ?? null, selected_size: item.selected_size ?? null,
      selected_type: item.selected_type ?? null, image: product.color_images[item.selected_color ?? ""] ?? product.images[0],
    };
  });
  for (const [id, quantity] of needed) {
    const product = store.products.find((product) => product.id === id)!;
    if (quantity > product.stock_quantity - product.reserved_quantity) throw new Error(`${product.name} không đủ tồn kho.`);
    product.reserved_quantity += quantity;
  }
  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const shipping_fee = body.shipping_method === "delivery" ? 30000 : 0;
  const discount = body.discount_code ? getMockDiscount(body.discount_code) : null;
  if (body.discount_code && !discount) throw new Error("Mã giảm giá không hợp lệ.");
  const discount_code_amount = discount ? Math.ceil(subtotal * discount.value / 100) : 0;
  const total = Math.max(0, subtotal + shipping_fee - discount_code_amount);
  const id = crypto.randomUUID();
  const order: Order = {
    id, order_code: `DEMO-${id.slice(0, 8).toUpperCase()}`, status: "init",
    customer_name: body.customer_name, customer_phone: body.customer_phone,
    customer_email: body.customer_email, customer_address: body.customer_address ?? "",
    created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
    subtotal, shipping_fee, discount_code_amount, total, items, order_items: items,
    payment_info: {
      account_name: "INDI MERCH DEMO", account_number: "DEMO-0000", bin: "DEMO",
      amount: total, description: `DEMO ${id.slice(0, 8)}`,
      qr_code: `indi-merch-demo://pay?order=${id}&amount=${total}`,
    },
  };
  store.orders.unshift(order);
  save(store);
  return order;
}

export function getMockOrder(id: string): Order {
  const order = load().orders.find((order) => order.id === id);
  if (!order) throw new Error("Không tìm thấy đơn demo trên trình duyệt này.");
  return order;
}

export function settleMockOrder(id: string, status: "done" | "cancel" = "done"): Order {
  const store = load();
  const order = store.orders.find((order) => order.id === id);
  if (!order) throw new Error("Không tìm thấy đơn hàng.");
  transition(store, order, status);
  save(store);
  return order;
}

export function mockAdminRequest(url: string, init?: RequestInit): unknown {
  const method = init?.method ?? "GET";
  const body = typeof init?.body === "string" ? JSON.parse(init.body) : {};
  if (url === "/api/admin/session") {
    if (method === "DELETE") localStorage.removeItem(SESSION_KEY);
    return { configured: true, authenticated: localStorage.getItem(SESSION_KEY) === "google-demo" };
  }
  if (url === "/api/admin/login" && method === "POST" && body.provider === "google-demo") {
    localStorage.setItem(SESSION_KEY, "google-demo");
    return { ok: true };
  }
  if (localStorage.getItem(SESSION_KEY) !== "google-demo") throw new Error("Vui lòng đăng nhập Google Demo.");
  const store = load();
  if (url === "/api/admin/orders" && method === "GET") return store.orders;
  if (url.startsWith("/api/admin/orders/") && method === "PATCH") {
    if (body.status !== "done" && body.status !== "cancel") throw new Error("Trạng thái không hợp lệ.");
    return settleMockOrder(decodeURIComponent(url.split("/").pop()!), body.status);
  }
  if (url === "/api/admin/products" && method === "GET") return store.products;
  if ((url === "/api/admin/products" && method === "POST") || (url.startsWith("/api/admin/products/") && method === "PATCH")) {
    const product = method === "PATCH" ? store.products.find((product) => product.id === decodeURIComponent(url.split("/").pop()!)) : undefined;
    if (method === "PATCH" && !product) throw new Error("Không tìm thấy sản phẩm.");
    if (typeof body.name !== "string" || !body.name.trim() || !Number.isSafeInteger(body.price) || body.price < 0 || !Number.isSafeInteger(body.stock_quantity) || body.stock_quantity < (product?.reserved_quantity ?? 0)) {
      throw new Error("Tên, giá hoặc tồn kho không hợp lệ.");
    }
    if (product) {
      Object.assign(product, { name: body.name.trim(), price: body.price, stock_quantity: body.stock_quantity, active: Boolean(body.active) });
    } else {
      if (typeof body.image !== "string" || !body.image.startsWith("/")) throw new Error("Đường dẫn ảnh phải bắt đầu bằng /.");
      store.products.push({ id: crypto.randomUUID(), name: body.name.trim(), price: body.price, stock_quantity: body.stock_quantity, reserved_quantity: 0, active: true, description: body.description ?? "", images: [body.image], colors: [], sizes: [], types: [], color_images: {} });
    }
    save(store);
    return product ?? store.products.at(-1);
  }
  throw new Error("Thao tác demo chưa được hỗ trợ.");
}

import { randomUUID } from "node:crypto";
import { withTransaction, getDatabase, type DatabaseClient } from "@/lib/db";
import { PHONE_NUMBER_REGEX } from "@/lib/schema";

type IncomingOrderItem = {
  merch_id: string;
  quantity: number;
  selected_type?: string | null;
  selected_color?: string | null;
  selected_size?: string | null;
};

type IncomingOrder = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address?: string;
  shipping_method?: "pickup_store" | "pickup_event" | "delivery";
  discount_code?: string;
  order_items: IncomingOrderItem[];
};

type ProductRow = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  reserved_quantity: number;
  active: boolean;
  colors: string[];
  sizes: string[];
  types: string[];
  images: string[];
};

type OrderRow = Record<string, unknown> & {
  id: string;
  order_code: string;
  status: string;
  payment_info: Record<string, string | number>;
  expires_at: Date | string;
};

export class OrderError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "OrderError";
  }
}

function requiredText(value: unknown, label: string, maxLength = 200): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new OrderError(`${label} is required.`);
  }
  return value.trim();
}

function validSelection(selected: string | null | undefined, options: string[], label: string) {
  if (selected && !options.includes(selected)) {
    throw new OrderError(`The selected ${label} is no longer available.`);
  }
}

function paymentInfo(orderCode: string, id: string, amount: number) {
  const description = `INDI${orderCode.replace(/-/g, "")}`;
  const accountName = process.env.PAYMENT_ACCOUNT_NAME || "INDI MERCH DEMO";
  const accountNumber = process.env.PAYMENT_ACCOUNT_NUMBER || "DEMO-0000";
  const bin = process.env.PAYMENT_BANK_BIN || "DEMO";
  return {
    account_name: accountName,
    account_number: accountNumber,
    amount,
    bin,
    description,
    qr_code: `indi-merch-demo://pay?order=${encodeURIComponent(id)}&amount=${amount}&content=${description}`,
  };
}

export async function createMerchOrder(input: IncomingOrder) {
  const customerName = requiredText(input.customer_name, "Customer name");
  const customerPhone = requiredText(input.customer_phone, "Phone number", 40);
  if (!PHONE_NUMBER_REGEX.test(customerPhone)) throw new OrderError("Phone number is invalid.");
  const customerEmail = requiredText(input.customer_email, "Email", 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    throw new OrderError("Email address is invalid.");
  }
  const customerAddress = typeof input.customer_address === "string" ? input.customer_address.trim() : "";
  const shippingMethod = input.shipping_method ?? "pickup_store";
  if (!["pickup_store", "pickup_event", "delivery"].includes(shippingMethod)) {
    throw new OrderError("Shipping method is invalid.");
  }
  if (shippingMethod === "delivery" && !customerAddress) {
    throw new OrderError("Delivery address is required.");
  }
  if (!Array.isArray(input.order_items) || input.order_items.length === 0 || input.order_items.length > 40) {
    throw new OrderError("Add at least one product to your order.");
  }

  const items = input.order_items.map((item) => {
    const id = requiredText(item?.merch_id, "Product id", 100);
    const quantity = Number(item?.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 40) {
      throw new OrderError("Product quantities must be between 1 and 40.");
    }
    return {
      id,
      quantity,
      selectedType: item.selected_type?.trim() || null,
      selectedColor: item.selected_color?.trim() || null,
      selectedSize: item.selected_size?.trim() || null,
    };
  });

  await expireStaleOrders();
  return withTransaction(async (client) => {
    const ids = [...new Set(items.map((item) => item.id))];
    const productResult = await client.query<ProductRow>(
      `SELECT id, name, price, stock_quantity, reserved_quantity, active, colors, sizes, types, images
         FROM merch_products WHERE id = ANY($1::text[]) FOR UPDATE`,
      [ids],
    );
    const products = new Map(productResult.rows.map((product) => [product.id, product]));
    if (products.size !== ids.length) throw new OrderError("A product in your cart is no longer available.", 409);

    const totalsByProduct = new Map<string, number>();
    for (const item of items) {
      const product = products.get(item.id)!;
      if (!product.active) throw new OrderError(`${product.name} is not available.`, 409);
      validSelection(item.selectedColor, product.colors ?? [], "color");
      validSelection(item.selectedSize, product.sizes ?? [], "size");
      validSelection(item.selectedType, product.types ?? [], "type");
      totalsByProduct.set(item.id, (totalsByProduct.get(item.id) ?? 0) + item.quantity);
    }
    for (const [id, quantity] of totalsByProduct) {
      const product = products.get(id)!;
      if (product.stock_quantity - product.reserved_quantity < quantity) {
        throw new OrderError(`${product.name} does not have enough stock.`, 409);
      }
    }

    const subtotal = items.reduce(
      (total, item) => total + products.get(item.id)!.price * item.quantity,
      0,
    );
    const shippingFee = shippingMethod === "delivery" ? 30000 : 0;
    let discountCode: string | null = null;
    let discountAmount = 0;
    const normalizedCode = input.discount_code?.trim().toUpperCase();
    if (normalizedCode) {
      const discountResult = await client.query<{
        code: string;
        type: "fixed" | "percentage";
        value: number;
        min_order_value: number;
        max_uses: number | null;
        used_count: number;
        reserved_uses: number;
        expires_at: Date | null;
        status: string;
      }>("SELECT * FROM merch_discounts WHERE code = $1 FOR UPDATE", [normalizedCode]);
      const discount = discountResult.rows[0];
      if (
        !discount ||
        discount.status !== "active" ||
        (discount.expires_at && new Date(discount.expires_at).getTime() <= Date.now()) ||
        (discount.max_uses !== null && discount.used_count + discount.reserved_uses >= discount.max_uses)
      ) {
        throw new OrderError("Discount code is invalid or no longer available.", 409);
      }
      if (subtotal < discount.min_order_value) {
        throw new OrderError(`Discount code requires an order of at least ${discount.min_order_value} VND.`);
      }
      discountCode = discount.code;
      discountAmount = Math.min(
        subtotal,
        discount.type === "percentage"
          ? Math.ceil((subtotal * discount.value) / 100)
          : discount.value,
      );
      await client.query(
        "UPDATE merch_discounts SET reserved_uses = reserved_uses + 1, updated_at = NOW() WHERE code = $1",
        [discountCode],
      );
    }

    for (const [id, quantity] of totalsByProduct) {
      await client.query(
        "UPDATE merch_products SET reserved_quantity = reserved_quantity + $2, updated_at = NOW() WHERE id = $1",
        [id, quantity],
      );
    }

    const id = randomUUID();
    const orderCode = `INDI-${randomUUID().slice(0, 8).toUpperCase()}`;
    const total = Math.max(0, subtotal + shippingFee - discountAmount);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const info = paymentInfo(orderCode, id, total);
    await client.query(
      `INSERT INTO merch_orders
        (id, order_code, customer_name, customer_phone, customer_email, customer_address,
         shipping_method, subtotal, shipping_fee, discount_code, discount_code_amount,
         total, payment_method, payment_info, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'bank_transfer', $13, 'init', $14)`,
      [id, orderCode, customerName, customerPhone, customerEmail, customerAddress,
        shippingMethod, subtotal, shippingFee, discountCode, discountAmount, total,
        JSON.stringify(info), expiresAt],
    );

    const orderItems = [];
    for (const item of items) {
      const product = products.get(item.id)!;
      orderItems.push({
        merch_id: item.id,
        merch_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: product.price * item.quantity,
        selected_type: item.selectedType,
        selected_color: item.selectedColor,
        selected_size: item.selectedSize,
        image: product.images?.[0] ?? "",
      });
      await client.query(
        `INSERT INTO merch_order_items
          (id, order_id, product_id, merch_name, quantity, unit_price, subtotal,
           selected_type, selected_color, selected_size, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [randomUUID(), id, item.id, product.name, item.quantity, product.price,
          product.price * item.quantity, item.selectedType, item.selectedColor,
          item.selectedSize, product.images?.[0] ?? ""],
      );
    }

    return {
      id,
      order_code: orderCode,
      status: "init",
      subtotal,
      shipping_fee: shippingFee,
      discount_code_amount: discountAmount,
      total,
      order_items: orderItems,
      payment_info: info,
      expires_at: expiresAt.toISOString(),
    };
  });
}

async function settleOrder(client: DatabaseClient, order: OrderRow, status: "done" | "cancel" | "drop") {
  if (order.status !== "init" && order.status !== "in_progress") return order;
  const items = await client.query<{ product_id: string | null; quantity: number }>(
    "SELECT product_id, quantity FROM merch_order_items WHERE order_id = $1",
    [order.id],
  );
  for (const item of items.rows) {
    if (!item.product_id) continue;
    if (status === "done") {
      await client.query(
        `UPDATE merch_products
            SET stock_quantity = stock_quantity - $2,
                reserved_quantity = GREATEST(0, reserved_quantity - $2), updated_at = NOW()
          WHERE id = $1`,
        [item.product_id, item.quantity],
      );
    } else {
      await client.query(
        "UPDATE merch_products SET reserved_quantity = GREATEST(0, reserved_quantity - $2), updated_at = NOW() WHERE id = $1",
        [item.product_id, item.quantity],
      );
    }
  }
  const code = await client.query<{ discount_code: string | null }>(
    "SELECT discount_code FROM merch_orders WHERE id = $1",
    [order.id],
  );
  if (code.rows[0]?.discount_code) {
    if (status === "done") {
      await client.query(
        "UPDATE merch_discounts SET reserved_uses = GREATEST(0, reserved_uses - 1), used_count = used_count + 1, updated_at = NOW() WHERE code = $1",
        [code.rows[0].discount_code],
      );
    } else {
      await client.query(
        "UPDATE merch_discounts SET reserved_uses = GREATEST(0, reserved_uses - 1), updated_at = NOW() WHERE code = $1",
        [code.rows[0].discount_code],
      );
    }
  }
  const result = await client.query<OrderRow>(
    "UPDATE merch_orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *",
    [order.id, status],
  );
  return result.rows[0] ?? order;
}

async function expireOrderIfNeeded(orderId: string) {
  await withTransaction(async (client) => {
    const result = await client.query<OrderRow>(
      "SELECT * FROM merch_orders WHERE id = $1 FOR UPDATE",
      [orderId],
    );
    const order = result.rows[0];
    if (order && (order.status === "init" || order.status === "in_progress") && new Date(order.expires_at).getTime() <= Date.now()) {
      await settleOrder(client, order, "drop");
    }
  });
}

async function expireStaleOrders() {
  await withTransaction(async (client) => {
    const result = await client.query<OrderRow>(
      `SELECT * FROM merch_orders
        WHERE status IN ('init', 'in_progress') AND expires_at <= NOW()
        ORDER BY expires_at LIMIT 100 FOR UPDATE SKIP LOCKED`,
    );
    for (const order of result.rows) await settleOrder(client, order, "drop");
  });
}

export async function getMerchOrder(orderId: string) {
  await expireOrderIfNeeded(orderId);
  const database = await getDatabase();
  const result = await database.query<OrderRow>("SELECT * FROM merch_orders WHERE id = $1", [orderId]);
  const order = result.rows[0];
  if (!order) return null;
  return {
    id: order.id,
    order_code: order.order_code,
    status: order.status,
    subtotal: order.subtotal,
    shipping_fee: order.shipping_fee,
    discount_code_amount: order.discount_code_amount,
    total: order.total,
    payment_info: order.payment_info,
    expires_at: order.expires_at,
  };
}

export async function setMerchOrderStatus(orderId: string, status: "done" | "cancel" | "drop") {
  return withTransaction(async (client) => {
    const result = await client.query<OrderRow>(
      "SELECT * FROM merch_orders WHERE id = $1 FOR UPDATE",
      [orderId],
    );
    const order = result.rows[0];
    if (!order) throw new OrderError("Order not found.", 404);
    if (order.status === status) return order;
    if (order.status === "done" || order.status === "cancel" || order.status === "drop") {
      throw new OrderError("This order has already been completed or closed.", 409);
    }
    return settleOrder(client, order, status);
  });
}

export async function simulateOrderPayment(orderId: string) {
  if (process.env.PAYMENT_SIMULATION !== "true") {
    throw new OrderError("Payment simulation is disabled.", 403);
  }
  const order = await setMerchOrderStatus(orderId, "done");
  return { id: order.id, order_code: order.order_code, status: order.status };
}

export async function listAdminOrders() {
  await expireStaleOrders();
  const database = await getDatabase();
  const orders = await database.query<OrderRow>(
    "SELECT * FROM merch_orders ORDER BY created_at DESC LIMIT 300",
  );
  if (!orders.rows.length) return [];
  const items = await database.query<Record<string, unknown>>(
    "SELECT * FROM merch_order_items WHERE order_id = ANY($1::uuid[]) ORDER BY order_id",
    [orders.rows.map((order) => order.id)],
  );
  const itemsByOrder = new Map<string, Record<string, unknown>[]>();
  for (const item of items.rows) {
    const orderId = String(item.order_id);
    itemsByOrder.set(orderId, [...(itemsByOrder.get(orderId) ?? []), item]);
  }
  return orders.rows.map((order) => ({ ...order, items: itemsByOrder.get(order.id) ?? [] }));
}

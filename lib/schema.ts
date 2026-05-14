import * as v from "valibot";

import {
  DISCOUNT_CODE_STATUS,
  DISCOUNT_CODE_TYPE,
  EVENT_STATUS,
  ORDER_STATUS,
  PAYMENT_METHOD,
  TICKET_STATUS,
  TICKET_TYPE_STATUS,
} from "@/lib/types";

export const PHONE_NUMBER_REGEX = /^(?:\+84|0084|0)[235789][0-9]{1,2}[0-9]{7}$/;

const uuidSchema = v.pipe(v.string(), v.uuid());
const requiredDateSchema = v.pipe(v.string(), v.minLength(1));
const nullableDateSchema = v.nullable(requiredDateSchema);
const nonNegativeIntegerSchema = v.pipe(v.number(), v.integer(), v.minValue(0));
const nullableNonNegativeIntegerSchema = v.nullable(nonNegativeIntegerSchema);

const statusEventSchema = v.picklist([
  EVENT_STATUS.DRAFT,
  EVENT_STATUS.PUBLISHED,
  EVENT_STATUS.ENDED,
]);
const statusTicketTypeSchema = v.picklist([
  TICKET_TYPE_STATUS.ACTIVE,
  TICKET_TYPE_STATUS.HIDDEN,
]);
const statusDiscountCodeSchema = v.picklist([
  DISCOUNT_CODE_STATUS.ACTIVE,
  DISCOUNT_CODE_STATUS.DISABLED,
]);
const statusOrderSchema = v.picklist([
  ORDER_STATUS.INIT,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.DONE,
  ORDER_STATUS.DROP,
  ORDER_STATUS.CANCEL,
]);

const paymentMethodSchema = v.picklist([
  PAYMENT_METHOD.BANK_TRANSFER,
  PAYMENT_METHOD.CASH,
]);
const statusTicketSchema = v.picklist([
  TICKET_STATUS.ACTIVE,
  TICKET_STATUS.INACTIVE,
  TICKET_STATUS.CHECK_IN,
  TICKET_STATUS.EXPIRE,
]);

const eventCoreSchema = v.object({
  id: uuidSchema,
  name: v.pipe(v.string(), v.minLength(1)),
  slug: v.pipe(v.string(), v.minLength(1)),
  description: v.nullable(v.string()),
  date_start: v.string(),
  venue: v.pipe(v.string(), v.minLength(1)),
  status: statusEventSchema,
  date_created: requiredDateSchema,
  date_updated: nullableDateSchema,
});

const ticketTypeCoreSchema = v.object({
  id: uuidSchema,
  name: v.pipe(v.string(), v.minLength(1)),
  price_original: v.pipe(v.number(), v.minValue(0)),
  price_sale: v.nullable(v.pipe(v.number(), v.minValue(0))),
  quantity_total: nonNegativeIntegerSchema,
  quantity_sold: nonNegativeIntegerSchema,
  max_per_order: v.pipe(v.number(), v.integer(), v.minValue(1)),
  benefits: v.nullable(v.string()),
  sort: nullableNonNegativeIntegerSchema,
  status: statusTicketTypeSchema,
  date_created: requiredDateSchema,
  date_updated: nullableDateSchema,
});

const discountTierCoreSchema = v.object({
  id: uuidSchema,
  min_quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
  max_quantity: nullableNonNegativeIntegerSchema,
  discount_amount: v.pipe(v.number(), v.minValue(0)),
  date_created: requiredDateSchema,
  date_updated: nullableDateSchema,
});

const discountCodeCoreSchema = v.object({
  id: uuidSchema,
  code: v.pipe(v.string(), v.minLength(1), v.toUpperCase()),
  type: v.picklist([DISCOUNT_CODE_TYPE.FIXED, DISCOUNT_CODE_TYPE.PERCENTAGE]),
  value: v.pipe(v.number(), v.minValue(0)),
  min_order_value: v.pipe(v.number(), v.minValue(0)),
  max_uses: nullableNonNegativeIntegerSchema,
  used_count: nonNegativeIntegerSchema,
  expires_at: nullableDateSchema,
  status: statusDiscountCodeSchema,
  date_created: requiredDateSchema,
  date_updated: nullableDateSchema,
});

const paymentInfoSchema = v.object({
  account_name: v.pipe(v.string(), v.minLength(1)),
  account_number: v.pipe(v.string(), v.minLength(1)),
  amount: v.pipe(v.number(), v.minValue(0)),
  bin: v.pipe(v.string(), v.minLength(1)),
  description: v.pipe(v.string(), v.minLength(1)),
  qr_code: v.pipe(v.string(), v.minLength(1)),
});

const orderCoreSchema = v.object({
  id: uuidSchema,
  order_code: v.pipe(v.string(), v.minLength(1)),
  customer_name: v.pipe(v.string(), v.minLength(1)),
  customer_phone: v.pipe(v.string(), v.regex(PHONE_NUMBER_REGEX)),
  customer_email: v.pipe(v.string(), v.email()),
  subtotal: v.pipe(v.number(), v.minValue(0)),
  discount_combo: v.pipe(v.number(), v.minValue(0)),
  discount_code_amount: v.pipe(v.number(), v.minValue(0)),
  payment_method: paymentMethodSchema,
  payment_info: paymentInfoSchema,
  total: v.pipe(v.number(), v.minValue(0)),
  status: statusOrderSchema,
  expires_at: nullableDateSchema,
  date_created: requiredDateSchema,
  date_updated: nullableDateSchema,
});
const merchOrderCoreSchema = v.object({
  id: uuidSchema,
  customer_name: v.pipe(v.string(), v.minLength(1)),
  customer_phone: v.pipe(v.string(), v.regex(PHONE_NUMBER_REGEX)),
  customer_email: v.pipe(v.string(), v.email()),
  customer_address: v.pipe(v.string(), v.minLength(1)),
  subtotal: v.pipe(v.number(), v.minValue(0)),
  discount_combo: v.pipe(v.number(), v.minValue(0)),
  discount_code_amount: v.pipe(v.number(), v.minValue(0)),
  payment_method: paymentMethodSchema,
  payment_info: paymentInfoSchema,
  total: v.pipe(v.number(), v.minValue(0)),
  status: statusOrderSchema,
  expires_at: nullableDateSchema,
  date_created: requiredDateSchema,
  date_updated: nullableDateSchema,
});
const orderItemCoreSchema = v.object({
  id: uuidSchema,
  quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
  unit_price: v.pipe(v.number(), v.minValue(0)),
  subtotal: v.pipe(v.number(), v.minValue(0)),
  date_created: requiredDateSchema,
  date_updated: nullableDateSchema,
});

const ticketCoreSchema = v.object({
  id: uuidSchema,
  status: statusTicketSchema,
  checked_in_at: nullableDateSchema,
  date_created: requiredDateSchema,
  date_updated: nullableDateSchema,
});

export const ticketDiscountTierSchema = v.object({
  ...discountTierCoreSchema.entries,
  ticket_type_id: uuidSchema,
});

export const ticketTypeSchema = v.object({
  ...ticketTypeCoreSchema.entries,
  event_id: uuidSchema,
  discount_tiers: v.array(ticketDiscountTierSchema),
});

export const discountCodeSchema = v.object({
  ...discountCodeCoreSchema.entries,
  event_id: v.union([uuidSchema, v.null()]),
});

export const eventSchema = v.object({
  ...eventCoreSchema.entries,
  ticket_types: v.array(ticketTypeSchema),
});

export const ticketSchema = v.object({
  ...ticketCoreSchema.entries,
  order_id: v.union([uuidSchema, orderCoreSchema]),
  order_item_id: v.union([uuidSchema, orderItemCoreSchema]),
  ticket_type_id: v.union([uuidSchema, ticketTypeCoreSchema]),
});

export const orderItemSchema = v.object({
  ...orderItemCoreSchema.entries,
  order_id: v.union([uuidSchema, orderCoreSchema]),
  ticket_type_id: v.union([uuidSchema, ticketTypeSchema]),
  tickets: v.union([v.array(uuidSchema), v.array(ticketSchema)]),
});

export const orderSchema = v.object({
  ...orderCoreSchema.entries,
  event_id: v.union([uuidSchema, eventCoreSchema]),
  discount_code_id: v.union([uuidSchema, discountCodeCoreSchema, v.null()]),
  ticket_discount_tier_id: v.union([
    uuidSchema,
    ticketDiscountTierSchema,
    v.null(),
  ]),
  order_items: v.union([v.array(uuidSchema), v.array(orderItemSchema)]),
  tickets: v.union([v.array(uuidSchema), v.array(ticketSchema)]),
});
export const merchOrderSchema = v.object({
  ...merchOrderCoreSchema.entries,

  discount_code_id: v.union([uuidSchema, discountCodeCoreSchema, v.null()]),
});
export const orderItemWithRelationsSchema = v.object({
  ...orderItemCoreSchema.entries,
  order_id: orderSchema,
  ticket_type_id: ticketTypeSchema,
  tickets: v.array(ticketSchema),
});

export const orderWithRelationsSchema = v.object({
  ...orderCoreSchema.entries,
  event_id: eventSchema,
  discount_code_id: v.union([discountCodeSchema, v.null()]),
  ticket_discount_tier_id: v.union([ticketDiscountTierSchema, v.null()]),
  order_items: v.array(orderItemWithRelationsSchema),
  tickets: v.array(ticketSchema),
});

export const discountCodeListSchema = v.array(discountCodeSchema);

// Input types - raw data before validation and transformation
export type EventInput = v.InferInput<typeof eventSchema>;
export type TicketTypeInput = v.InferInput<typeof ticketTypeSchema>;
export type DiscountCodeInput = v.InferInput<typeof discountCodeSchema>;
export type OrderInput = v.InferInput<typeof orderSchema>;
export type MerchOrderInput = v.InferInput<typeof merchOrderSchema>;

// Output types - validated and transformed data after schema processing
export type EventOutput = v.InferOutput<typeof eventSchema>;
export type TicketTypeOutput = v.InferOutput<typeof ticketTypeSchema>;
export type DiscountCodeOutput = v.InferOutput<typeof discountCodeSchema>;
export type OrderOutput = v.InferOutput<typeof orderSchema>;
export type PaymentInfoOutput = v.InferOutput<typeof paymentInfoSchema>;
export type MerchOrderOutput = v.InferOutput<typeof merchOrderSchema>;
// Resolved types - aliases kept for backward compatibility
export type EventResolved = EventOutput;
export type TicketTypeResolved = EventResolved["ticket_types"][number];
export function validateMerchOrder(input: unknown) {
  return v.safeParse(merchOrderSchema, input);
}
export function validateEvent(input: unknown) {
  return v.safeParse(eventSchema, input);
}

export function validateTicketType(input: unknown) {
  return v.safeParse(ticketTypeSchema, input);
}

export function validateDiscountCode(input: unknown) {
  return v.safeParse(discountCodeSchema, input);
}

export function validateOrder(input: unknown) {
  return v.safeParse(orderSchema, input);
}

export function validateOrderWithRelations(input: unknown) {
  return v.safeParse(orderWithRelationsSchema, input);
}

export function validateEmail(input: string) {
  return v.safeParse(v.pipe(v.string(), v.email()), input);
}

export function validatePhone(input: string) {
  return v.safeParse(v.pipe(v.string(), v.regex(PHONE_NUMBER_REGEX)), input);
}

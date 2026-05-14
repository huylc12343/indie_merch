export interface MerchImage {
  directus_files_id: {
    id: string;
  };
}

export interface MerchItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  merch_images?: MerchImage[];
  colors?: string[];
  sizes?: string[];
  types?: string[];
  description?: string;
  status?: string;
}

export interface CartItem {
  cartKey: string;

  id: string;

  name: string;

  price: number;

  quantity: number;

  image: string;

  selectedColor?: string | null;

  selectedSize?: string | null;

  selectedType?: string | null;

  availableColors?: string[];

  availableSizes?: string[];

  availableTypes?: string[];
}

export const EVENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ENDED: "ended",
} as const;

export type EventStatus =
  (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

export const TICKET_TYPE_STATUS = {
  ACTIVE: "active",
  HIDDEN: "hidden",
} as const;

export type TicketTypeStatus =
  (typeof TICKET_TYPE_STATUS)[keyof typeof TICKET_TYPE_STATUS];

export const DISCOUNT_CODE_STATUS = {
  ACTIVE: "active",
  DISABLED: "disabled",
} as const;

export type DiscountCodeStatus =
  (typeof DISCOUNT_CODE_STATUS)[keyof typeof DISCOUNT_CODE_STATUS];

export const DISCOUNT_CODE_TYPE = {
  FIXED: "fixed",
  PERCENTAGE: "percentage",
} as const;

export type DiscountCodeType =
  (typeof DISCOUNT_CODE_TYPE)[keyof typeof DISCOUNT_CODE_TYPE];

export const ORDER_STATUS = {
  INIT: "init",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  DROP: "drop",
  CANCEL: "cancel",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_METHOD = {
  BANK_TRANSFER: "bank_transfer",
  CASH: "cash",
} as const;

export type PAYMENT_METHOD =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const TICKET_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  CHECK_IN: "check_in",
  EXPIRE: "expire",
} as const;

export type TicketStatus =
  (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
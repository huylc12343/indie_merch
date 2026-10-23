CREATE TABLE IF NOT EXISTS merch_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL DEFAULT '',
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  colors TEXT[] NOT NULL DEFAULT '{}',
  sizes TEXT[] NOT NULL DEFAULT '{}',
  types TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  color_images JSONB NOT NULL DEFAULT '{}',
  directus_synced BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (reserved_quantity <= stock_quantity)
);

ALTER TABLE merch_products
  ADD COLUMN IF NOT EXISTS directus_synced BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS merch_discounts (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('fixed', 'percentage')),
  value INTEGER NOT NULL CHECK (value >= 0),
  min_order_value INTEGER NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses >= 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  reserved_uses INTEGER NOT NULL DEFAULT 0 CHECK (reserved_uses >= 0),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merch_orders (
  id UUID PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT NOT NULL DEFAULT '',
  shipping_method TEXT NOT NULL CHECK (shipping_method IN ('pickup_store', 'pickup_event', 'delivery')),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  shipping_fee INTEGER NOT NULL CHECK (shipping_fee >= 0),
  discount_combo INTEGER NOT NULL DEFAULT 0 CHECK (discount_combo >= 0),
  discount_code TEXT REFERENCES merch_discounts(code) ON DELETE SET NULL,
  discount_code_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_code_amount >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  payment_info JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'init' CHECK (status IN ('init', 'in_progress', 'done', 'drop', 'cancel')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merch_order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES merch_orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES merch_products(id) ON DELETE SET NULL,
  merch_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  selected_type TEXT,
  selected_color TEXT,
  selected_size TEXT,
  image TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS merch_orders_created_at_idx ON merch_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS merch_orders_status_idx ON merch_orders (status);
CREATE INDEX IF NOT EXISTS merch_order_items_order_id_idx ON merch_order_items (order_id);

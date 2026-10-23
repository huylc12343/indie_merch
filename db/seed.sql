INSERT INTO merch_products (id, name, price, description, stock_quantity, active, colors, sizes, images, color_images)
VALUES
  ('bandana', 'Bandana', 159000, 'Kích thước: 70 × 70 cm\nChất liệu: Lụa satin', 40, TRUE, '{}', '{}', ARRAY['/merch/bandana.webp'], '{}'),
  ('indie-shirt', 'Áo Indie', 249000, 'Chất liệu: Cotton', 40, TRUE, ARRAY['Trắng', 'Đen'], ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL'], ARRAY['/merch/indie-shirt-white.webp', '/merch/indie-shirt-black.webp'], '{"Trắng":"/merch/indie-shirt-white.webp","Đen":"/merch/indie-shirt-black.webp"}'),
  ('notebook', 'Sổ tay', 39000, 'Kích thước: 10.5 × 14.8 cm', 40, TRUE, '{}', '{}', ARRAY['/merch/notebook.webp'], '{}'),
  ('sticker', 'Sticker', 15000, 'Kích thước: 14.8 × 21 cm', 40, TRUE, '{}', '{}', ARRAY['/merch/sticker.webp'], '{}'),
  ('hand-fan', 'Quạt tay', 99000, 'Kích thước: 22 × 40 cm\nChất liệu: Vải lụa gió', 40, TRUE, '{}', '{}', ARRAY['/merch/hand-fan.webp'], '{}'),
  ('lanyard', 'Lanyard', 69000, 'Kích thước: 2 × 85 cm', 40, TRUE, '{}', '{}', ARRAY['/merch/lanyard.webp'], '{}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO merch_discounts (code, type, value, min_order_value, max_uses, status)
VALUES ('INDI10', 'percentage', 10, 100000, NULL, 'active')
ON CONFLICT (code) DO NOTHING;

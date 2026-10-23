import type { MerchItem } from "./types";

export const localMerch: MerchItem[] = [
  {
    id: "bandana",
    name: "Bandana",
    price: 159_000,
    soldOut: false,
    description: "Kích thước: 70 × 70 cm\nChất liệu: Lụa satin",
    merch_images: [{ directus_files_id: { id: "/merch/bandana.webp" } }],
  },
  {
    id: "indie-shirt",
    name: "Áo Indie",
    price: 249_000,
    soldOut: false,
    colors: ["Trắng", "Đen"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    description: "Chất liệu: Cotton",
    merch_images: [
      { directus_files_id: { id: "/merch/indie-shirt-white.webp" } },
      { directus_files_id: { id: "/merch/indie-shirt-black.webp" } },
    ],
    colorImages: {
      Trắng: "/merch/indie-shirt-white.webp",
      Đen: "/merch/indie-shirt-black.webp",
    },
  },
  {
    id: "notebook",
    name: "Sổ tay",
    price: 39_000,
    soldOut: false,
    description: "Kích thước: 10.5 × 14.8 cm",
    merch_images: [{ directus_files_id: { id: "/merch/notebook.webp" } }],
  },
  {
    id: "sticker",
    name: "Sticker",
    price: 15_000,
    soldOut: false,
    description: "Kích thước: 14.8 × 21 cm",
    merch_images: [{ directus_files_id: { id: "/merch/sticker.webp" } }],
  },
  {
    id: "hand-fan",
    name: "Quạt tay",
    price: 99_000,
    soldOut: false,
    description: "Kích thước: 22 × 40 cm\nChất liệu: Vải lụa gió",
    merch_images: [{ directus_files_id: { id: "/merch/hand-fan.webp" } }],
  },
  {
    id: "lanyard",
    name: "Lanyard",
    price: 69_000,
    soldOut: false,
    description: "Kích thước: 2 × 85 cm",
    merch_images: [{ directus_files_id: { id: "/merch/lanyard.webp" } }],
  },
];

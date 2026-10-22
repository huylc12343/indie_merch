import type { MerchItem } from "./types";

const imageOverrides: Array<{ matches: string[]; images: string[] }> = [
  { matches: ["bandana", "khan"], images: ["/merch/bandana.webp"] },
  {
    matches: ["ao indie", "indie shirt", "indie t-shirt"],
    images: [
      "/merch/indie-shirt-white.webp",
      "/merch/indie-shirt-black.webp",
    ],
  },
  { matches: ["notebook", "so tay"], images: ["/merch/notebook.webp"] },
  { matches: ["sticker"], images: ["/merch/sticker.webp"] },
  { matches: ["quat tay", "hand fan", "fan"], images: ["/merch/hand-fan.webp"] },
  { matches: ["lanyard", "day deo"], images: ["/merch/lanyard.webp"] },
];

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function replaceMerchImages(items: MerchItem[]): MerchItem[] {
  return items.map((item) => {
    const name = normalizeName(item.name);
    const override = imageOverrides.find(({ matches }) =>
      matches.some((match) => name.includes(match)),
    );

    if (!override) return item;

    return {
      ...item,
      merch_images: override.images.map((id) => ({
        directus_files_id: { id },
      })),
    };
  });
}

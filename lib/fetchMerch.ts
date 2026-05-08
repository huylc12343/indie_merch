import { MerchItem } from "../lib/types";

const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

export async function fetchMerch(): Promise<MerchItem[]> {
  if (!baseUrl) throw new Error("Missing NEXT_PUBLIC_DIRECTUS_URL");

  const res = await fetch(
    `${baseUrl}/items/merch?fields=*,merch_images.directus_files_id.*`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = await res.json();

  return json.data as MerchItem[];
}
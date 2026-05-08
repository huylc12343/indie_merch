import { readItems } from "@directus/sdk";
import { directus } from "./directus";
import { MerchItem } from "../lib/types";
export async function fetchMerch(): Promise<MerchItem[]> {
  const baseUrl = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;
  
  if (!baseUrl) {
    return [];
  }

  const url = `${baseUrl}/items/merch?fields=*,merch_images.directus_files_id.*`;
  
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch merch:", res.status);
    return [];
  }

  const json = await res.json();
  return json.data as MerchItem[];
}
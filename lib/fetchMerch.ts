import { MerchItem } from "../lib/types";
import { replaceMerchImages } from "./merchImageOverrides";

export async function fetchMerch(): Promise<MerchItem[]> {
  try {
    const baseUrl =
      process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!baseUrl) {
      throw new Error("Missing DIRECTUS_URL or NEXT_PUBLIC_DIRECTUS_URL");
    }

    const headers: Record<string, string> = {};
    if (process.env.DIRECTUS_TOKEN) {
      headers.Authorization = `Bearer ${process.env.DIRECTUS_TOKEN}`;
    }

    const res = await fetch(
      `${baseUrl}/items/merchs?fields=*,merch_images.directus_files_id.*`,
      { headers, cache: "no-store" },
    );
    if (!res.ok) {
      throw new Error(`Directus returned HTTP ${res.status}`);
    }

    const json: { data?: unknown } = await res.json();
    const items = Array.isArray(json.data) ? (json.data as MerchItem[]) : [];
    return replaceMerchImages(items);
  } catch (error) {
    console.warn("Could not load merch from Directus; showing no merch.", error);
    return [];
  }
}

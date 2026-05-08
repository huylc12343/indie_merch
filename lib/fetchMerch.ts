import { MerchItem } from "../lib/types";

export async function fetchMerch(): Promise<MerchItem[]> {
  const baseUrl =
    process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;

  if (!baseUrl) {
    throw new Error("DIRECTUS_URL is not defined");
  }

  const url = new URL(`${baseUrl}/items/merch`);
  url.searchParams.append("fields[]", "*");
  url.searchParams.append("fields[]", "merch_images.directus_files_id.*");

  const res = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch merch: HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data: unknown[] };

  return json.data as MerchItem[];
}
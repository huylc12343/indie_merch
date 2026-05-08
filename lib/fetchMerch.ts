import { readItems } from "@directus/sdk";
import { directus } from "./directus";
import { MerchItem } from "../lib/types";
export async function fetchMerch(): Promise<MerchItem[]> {
  const url = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/merch?fields=*,merch_images.directus_files_id.id`;
  
  const res = await fetch(url);
  const json = await res.json();
  
  return json.data as MerchItem[];
}
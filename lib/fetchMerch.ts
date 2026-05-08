import { readItems } from "@directus/sdk";
import { directus } from "./directus";
import { MerchItem } from "../lib/types";
export async function fetchMerch(): Promise<MerchItem[]> {
  const baseUrl = process.env.DIRECTUS_URL;
  
  console.log("DIRECTUS_URL:", baseUrl); // để debug
  
  const url = `${baseUrl}/items/merch?fields=*,merch_images.directus_files_id.*`;
  
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  
  console.log("Fetched data:", JSON.stringify(json)); // để debug
  
  return json.data as MerchItem[];
}
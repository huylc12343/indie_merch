import { readItems } from "@directus/sdk";
import { directus } from "./directus";
import { MerchItem } from "../lib/types";
export async function fetchMerch(): Promise<MerchItem[]> {
  const data = await directus.request(
    readItems("merch" as any, {
      fields: ["*", "merch_images.directus_files_id.*"] as any,
    }),
  );

  return data as unknown as MerchItem[];
}

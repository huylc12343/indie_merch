import { readItems } from "@directus/sdk";
import { directus } from "./directus";

export async function fetchMerch() {
  const data = await directus.request(
    readItems("merch", {
      fields: ["*", "merch_images.directus_files_id.*"],
    }),
  );

  console.log(JSON.stringify(data, null, 2));
  return data;
}

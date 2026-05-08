import { readItems } from "@directus/sdk";
import { directus } from "./directus";

export async function fetchMerch() {
  const data = await directus.request(
    readItems("merch", {
      fields: [
        "*"
      ],
    })
  );
  console.log("Fetched merch data:", data);
  return data;
}
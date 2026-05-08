import { readItems } from "@directus/sdk";
import { directus } from "./directus";

export async function fetchMerch() {
  const data = await directus.request(
    readItems("merch", {
      fields: [
        "id",
        "name",
        "price",
        "quantity",
        "description",
        "colors",
        "sizes",
        "types",
        "status",
        {
          "merchimages": ["directus_files_id"],
        },
      ],
    }),
  );

  console.log("Fetched merch data:", data);
  return data;
}

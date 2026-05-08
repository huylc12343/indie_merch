import { createDirectus, rest } from "@directus/sdk";
type Schema = {
  merch: {
    id: string;
    name: string;
    colors: string[];
    sizes: string[];
    types: string[];
    price: number;
    description: string;
    quantity: number;
    status: string;
    merchimages: {
      directus_files_id: string;
    }[];
  }[];
};
export const directus = createDirectus<Schema>(
  process.env.NEXT_PUBLIC_DIRECTUS_URL!
).with(rest());
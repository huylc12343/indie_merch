import type { MerchItem } from "@/lib/types";
import { getDatabase } from "@/lib/db";
import { localMerch } from "@/lib/localMerch";
import { replaceMerchImages } from "@/lib/merchImageOverrides";

type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  description: string;
  stock_quantity: number | string;
  reserved_quantity: number | string;
  active: boolean;
  colors: string[];
  sizes: string[];
  types: string[];
  images: string[];
  color_images: Record<string, string>;
};

function mapProduct(row: ProductRow): MerchItem {
  const images = row.images?.length ? row.images : ["/img_sample.png"];
  const quantity = Number(row.stock_quantity) - Number(row.reserved_quantity);
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    quantity,
    description: row.description,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    types: row.types ?? [],
    status: row.active ? "active" : "hidden",
    soldOut: !row.active || quantity <= 0,
    colorImages: row.color_images ?? {},
    merch_images: images.map((id) => ({ directus_files_id: { id } })),
  };
}

async function fetchFromDirectus(): Promise<MerchItem[]> {
  const baseUrl = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!baseUrl) throw new Error("DIRECTUS_URL is required for Directus catalog mode.");

  const headers: Record<string, string> = {};
  if (process.env.DIRECTUS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.DIRECTUS_TOKEN}`;
  }
  const response = await fetch(
    `${baseUrl}/items/merchs?fields=*,merch_images.directus_files_id.*`,
    { headers, cache: "no-store" },
  );
  if (!response.ok) throw new Error(`Directus returned HTTP ${response.status}`);
  const payload = (await response.json()) as { data?: MerchItem[] };
  const items = (payload.data ?? []).map((item) => {
    const quantity = Number(item.quantity ?? 0);
    const status = (item.status ?? "").toLowerCase();
    const images = (item.merch_images ?? []).map((image) => {
      const id = image.directus_files_id.id;
      return {
        directus_files_id: {
          id: id.startsWith("/") || id.startsWith("http") ? id : `${baseUrl}/assets/${id}`,
        },
      };
    });
    const colorImages = Object.fromEntries(
      Object.entries(item.colorImages ?? {}).map(([color, imageId]) => [
        color,
        imageId.startsWith("/") || imageId.startsWith("http") ? imageId : `${baseUrl}/assets/${imageId}`,
      ]),
    );
    return {
      ...item,
      id: String(item.id),
      quantity,
      status,
      soldOut: !["active", "available", "published"].includes(status) || quantity <= 0,
      merch_images: images,
      colorImages,
    };
  });
  return replaceMerchImages(items);
}

async function syncDirectusCatalog(
  database: Awaited<ReturnType<typeof getDatabase>>,
  items: MerchItem[],
) {
  for (const item of items) {
    const price = Number(item.price);
    const initialStock = Number(item.quantity ?? 0);
    if (!item.id || !item.name?.trim() || !Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(initialStock) || initialStock < 0) {
      continue;
    }
    const images = (item.merch_images ?? []).map((image) => image.directus_files_id.id);
    const active = item.status === "active" || item.status === "available" || item.status === "published";
    await database.query(
      `INSERT INTO merch_products
        (id, name, price, description, stock_quantity, active, colors, sizes, types, images, color_images, directus_synced)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, price = EXCLUDED.price, description = EXCLUDED.description,
         stock_quantity = CASE WHEN NOT merch_products.directus_synced
           THEN GREATEST(EXCLUDED.stock_quantity, merch_products.reserved_quantity)
           ELSE merch_products.stock_quantity END,
         directus_synced = TRUE,
         active = EXCLUDED.active, colors = EXCLUDED.colors, sizes = EXCLUDED.sizes,
         types = EXCLUDED.types, images = EXCLUDED.images, color_images = EXCLUDED.color_images,
         updated_at = NOW()`,
      [item.id, item.name.trim(), price, item.description ?? "", initialStock, active,
        item.colors ?? [], item.sizes ?? [], item.types ?? [], images,
        JSON.stringify(item.colorImages ?? {})],
    );
  }
}

export async function fetchMerch(): Promise<MerchItem[]> {
  const source = (process.env.MERCH_DATA_SOURCE || "postgres").toLowerCase();
  if (source === "mock" && !process.env.DATABASE_URL) {
    return replaceMerchImages(localMerch);
  }
  const database = await getDatabase();
  const directusItems = source === "directus" ? await fetchFromDirectus() : null;
  if (directusItems) await syncDirectusCatalog(database, directusItems);
  const result = await database.query<ProductRow>(
    `SELECT id, name, price, description, stock_quantity, reserved_quantity,
            active, colors, sizes, types, images, color_images
       FROM merch_products
      WHERE active = TRUE
      ORDER BY created_at, name`,
  );
  const products = result.rows.map(mapProduct);

  if (source === "mock") {
    const fixtures = new Map(localMerch.map((item) => [item.id, item]));
    return products.map((product) => ({
      ...product,
      merch_images: fixtures.get(product.id)?.merch_images ?? product.merch_images,
    }));
  }

  if (directusItems) {
    const directusIds = new Set(directusItems.map((item) => item.id));
    return products.filter((product) => directusIds.has(product.id));
  }

  return products;
}

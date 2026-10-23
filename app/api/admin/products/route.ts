import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { getDatabase } from "@/lib/db";

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean))]
    : [];
}

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const database = await getDatabase();
    const result = await database.query(
      `SELECT id, name, price, description, stock_quantity, reserved_quantity, active,
              colors, sizes, types, images, color_images, created_at, updated_at
         FROM merch_products WHERE kind = 'merch' ORDER BY created_at, name`,
    );
    return NextResponse.json(result.rows, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin product list failed:", error);
    return NextResponse.json({ error: "Could not load products." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const id = typeof body.id === "string"
      ? body.id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "")
      : name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const price = Number(body.price);
    const quantity = Number(body.stock_quantity);
    const image = typeof body.image === "string" ? body.image.trim() : "";
    if (!id || !name || name.length > 160 || !Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(quantity) || quantity < 0 || !image.startsWith("/")) {
      return NextResponse.json({ error: "Nhập tên, giá, tồn kho và đường dẫn ảnh bắt đầu bằng / hợp lệ." }, { status: 400 });
    }
    const database = await getDatabase();
    const result = await database.query(
      `INSERT INTO merch_products (id, name, price, description, stock_quantity, active, colors, sizes, types, images)
       VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7, $8, ARRAY[$9]::text[])
       RETURNING id, name, price, description, stock_quantity, reserved_quantity, active, colors, sizes, types, images, color_images, created_at, updated_at`,
      [id, name, price, typeof body.description === "string" ? body.description.trim() : "",
        quantity, stringList(body.colors), stringList(body.sizes), stringList(body.types), image],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create product.";
    const conflict = message.includes("duplicate key");
    if (!conflict) console.error("Admin product creation failed:", error);
    return NextResponse.json({ error: conflict ? "A product with this ID already exists." : "Could not create product." }, { status: conflict ? 409 : 500 });
  }
}

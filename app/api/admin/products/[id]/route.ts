import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { getDatabase } from "@/lib/db";

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean))]
    : [];
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { id } = await context.params;
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const price = Number(body.price);
    const quantity = Number(body.stock_quantity);
    if (!name || name.length > 160 || !Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(quantity) || quantity < 0 || typeof body.active !== "boolean") {
      return NextResponse.json({ error: "Tên, giá, tồn kho hoặc trạng thái không hợp lệ." }, { status: 400 });
    }
    const database = await getDatabase();
    const result = await database.query(
      `UPDATE merch_products
          SET name = $2, price = $3, description = $4, stock_quantity = $5, active = $6,
              colors = $7, sizes = $8, types = $9, updated_at = NOW()
        WHERE id = $1 AND reserved_quantity <= $5
        RETURNING id, name, price, description, stock_quantity, reserved_quantity, active, colors, sizes, types, images, color_images, created_at, updated_at`,
      [id, name, price, typeof body.description === "string" ? body.description.trim() : "",
        quantity, body.active, stringList(body.colors), stringList(body.sizes), stringList(body.types)],
    );
    if (!result.rows[0]) {
      const existing = await database.query("SELECT id FROM merch_products WHERE id = $1", [id]);
      return NextResponse.json(
        { error: existing.rows.length ? "Tồn kho không thể thấp hơn số lượng đang được giữ cho đơn chờ thanh toán." : "Không tìm thấy sản phẩm." },
        { status: existing.rows.length ? 409 : 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Admin product update failed:", error);
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}

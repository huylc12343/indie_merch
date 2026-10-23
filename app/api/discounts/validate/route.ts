import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  if (!code) return NextResponse.json({ data: null });

  try {
    const database = await getDatabase();
    const result = await database.query<{
      code: string;
      type: "fixed" | "percentage";
      value: number;
      min_order_value: number;
      max_uses: number | null;
      used_count: number;
      reserved_uses: number;
      expires_at: Date | null;
      status: string;
    }>("SELECT * FROM merch_discounts WHERE code = $1", [code]);
    const discount = result.rows[0];
    if (
      !discount ||
      discount.status !== "active" ||
      (discount.expires_at && new Date(discount.expires_at).getTime() <= Date.now()) ||
      (discount.max_uses !== null && discount.used_count + discount.reserved_uses >= discount.max_uses)
    ) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        id: randomUUID(),
        code: discount.code,
        type: discount.type,
        value: Number(discount.value),
        min_order_value: Number(discount.min_order_value),
        max_uses: discount.max_uses,
        used_count: Number(discount.used_count),
        expires_at: discount.expires_at?.toISOString() ?? null,
        status: "active",
        date_created: new Date().toISOString(),
        date_updated: null,
        event_id: null,
      },
    });
  } catch (error) {
    console.error("Discount lookup failed:", error);
    return NextResponse.json({ error: "Could not validate discount code." }, { status: 503 });
  }
}

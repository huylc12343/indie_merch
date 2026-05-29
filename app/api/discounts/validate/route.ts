// app/api/discount-codes/route.ts
import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.DIRECTUS_URL;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ data: null });
  }

  const normalizedCode = code.trim().toLowerCase();

  const response = await fetch(
    `${baseUrl}/items/discount_codes?filter[code][_eq]=${encodeURIComponent(normalizedCode)}&fields=*`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Directus error" },
      { status: response.status },
    );
  }

  const payload = await response.json();

  const item = payload.data?.[0];

  // ❌ Không tồn tại
  if (!item) {
    return NextResponse.json({ error: "NOT_FOUND" });
  }

  // ❌ Hết hạn / không available
  const validStatuses = ["available", "active"];
  if (!validStatuses.includes(item.status)) {
    return NextResponse.json({ error: "EXPIRED" });
  }
  const transformed = {
    ...item,
    id: crypto.randomUUID(),
    value: Number(item.value),
    min_order_value: Number(item.min_order_value ?? 150000), // 🔥 default 150k
    used_count: Number(item.used_count ?? 0),
    status: "active",
    event_id: null,
  };

  return NextResponse.json({ data: transformed });
}

// app/api/discount-codes/route.ts
import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.DIRECTUS_URL;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ data: [] });
  }

  const response = await fetch(
    `${baseUrl}/items/discount_codes?filter[code][_eq]=${encodeURIComponent(code)}&filter[status][_eq]=available&fields=*`,
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

  const payload = (await response.json()) as {
    data?: Record<string, unknown>[];
  };

  const transformed = (payload.data ?? []).map((item) => ({
    ...item,
    id: crypto.randomUUID(),        // id number → UUID
    value: Number(item.value),      // "10000.00000" → 10000
    min_order_value: Number(item.min_order_value ?? 0), // null → 0
    used_count: Number(item.used_count ?? 0),           // null → 0
    status: "active",               // "available" → "active"
    event_id: null,                 // "1" không phải UUID → null
  }));

  return NextResponse.json({ data: transformed });
}
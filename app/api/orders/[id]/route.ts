import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await context.params;

  const baseUrl = process.env.NEXT_PUBLIC_BE_URL;

  const res = await fetch(`${baseUrl}/api/orders/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: res.status }
    );
  }

  const data = await res.json();

  return NextResponse.json(data);
}
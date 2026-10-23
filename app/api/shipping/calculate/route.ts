import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const address = typeof body.address === "string" ? body.address.trim() : "";
    if (!address) return NextResponse.json({ error: "Vui lòng nhập địa chỉ nhận hàng." }, { status: 400 });
    return NextResponse.json({ shipping_fee: 30000 });
  } catch {
    return NextResponse.json({ error: "Thông tin giao hàng không hợp lệ." }, { status: 400 });
  }
}

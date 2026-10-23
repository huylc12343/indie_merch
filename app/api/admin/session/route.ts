import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, hasAdminSession, isAdminConfigured } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    configured: isAdminConfigured(),
    authenticated: hasAdminSession(request),
  });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

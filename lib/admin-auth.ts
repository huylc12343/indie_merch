import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "indie_merch_admin";
const SESSION_SECONDS = 60 * 60 * 12;

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function equal(left: string, right: string): boolean {
  const leftHash = createHmac("sha256", "indie-merch-compare").update(left).digest();
  const rightHash = createHmac("sha256", "indie-merch-compare").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

export function verifyAdminPassword(candidate: string): boolean {
  const password = process.env.ADMIN_PASSWORD || "";
  return isAdminConfigured() && equal(candidate, password);
}

export function createAdminSession(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function hasAdminSession(request: NextRequest): boolean {
  if (!isAdminConfigured()) return false;
  const value = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!value) return false;
  const [expiresText, nonce, signature, ...extra] = value.split(".");
  if (!expiresText || !nonce || !signature || extra.length > 0) return false;
  const expiresAt = Number(expiresText);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }
  return equal(signature, sign(`${expiresText}.${nonce}`));
}

import { parse } from "valibot";
import { discountCodeSchema, type DiscountCodeOutput } from "@/lib/schema";

export async function checkDiscountCode(
  code: string,
): Promise<DiscountCodeOutput | null> {
  const trimmedCode = code.trim().toUpperCase();
  if (!trimmedCode) return null;

  const response = await fetch(
    `/api/discounts/validate?code=${encodeURIComponent(trimmedCode)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Failed to check discount code: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { data?: unknown[] };
  return payload.data?.[0] ? parse(discountCodeSchema, payload.data[0]) : null;
}
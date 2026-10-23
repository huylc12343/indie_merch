import { redirect } from "next/navigation";
import { TICKET_SITE_URL } from "@/lib/sites";

export const dynamic = "force-dynamic";
export default async function TicketsPage({ searchParams }: { searchParams: Promise<{ event?: string }> }) {
  const { event } = await searchParams;
  const target = new URL(TICKET_SITE_URL);
  if (event) target.searchParams.set("event", event);
  redirect(target.href);
}

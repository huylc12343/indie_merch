import { fetchTicketEvents } from "@/lib/ticket-catalog";
import TicketShop from "@/components/ticketShop";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mua vé | In-đỉ In-đi" };
export default async function TicketsPage() {
  return <TicketShop initialEvents={await fetchTicketEvents()} />;
}

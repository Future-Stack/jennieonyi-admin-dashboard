"use client"
import CatStateCards, { ICatStateCards } from "@/components/admin/categories/CatStateCards";
import Headers from "@/components/admin/common/Headers";
import { TicketDetail } from "@/components/admin/support/TicketDetail";
import { TicketList } from "@/components/admin/support/TicketList";
import { dummyTickets } from "@/data/dummy-tickets";
import { Ticket } from "@/types/ticket";
import { Download, RefreshCw } from "lucide-react";
import { useState } from "react";

const stateCardsData: ICatStateCards[] = [
  {
    title: "Open Tickets",
    data: "24",
  },
  {
    title: "Under Review",
    data: "18",
  },
  {
    title: "Resolved",
    data: "401",
  },
  {
    title: "Customer Support",
    data: "54",
  },
  {
    title: "Vendor Support",
    data: "87",
  },
  {
    title: "Stylist Support",
    data: "29",
  },
]

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(dummyTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    dummyTickets[1]?.id ?? null // SUP-002 selected by default, matching the reference
  );

  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
  };
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white py-8 overflow-y-auto">
      <Headers
        title="Support Center"
        description="Handle all support requests — customers, stylists, vendors, and technical issues"
        buttonOneIcon={<Download className="w-4 h-4" />}
        buttonOneText="Export CSV"
        buttonOneAction={() => { }}
        buttonTwoIcon={<RefreshCw className="w-4 h-4" />}
        buttonTwoText="Refresh"
        buttonTwoAction={() => { }}
      />

      {/* cards  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 mb-6">
        {stateCardsData.map((card, index) => (
          <CatStateCards
            key={index}
            title={card.title}
            data={card.data}
          />
        ))}
      </div>


      <div className="flex flex-col md:flex-row w-full overflow-hidden">
        <div className="w-full md:w-90 lg:w-100">
          <TicketList
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={setSelectedTicketId}
          />
        </div>
        <div className="grow">
          <TicketDetail ticket={selectedTicket} onUpdateTicket={handleUpdateTicket} />
        </div>
      </div>
    </div>
  );
}

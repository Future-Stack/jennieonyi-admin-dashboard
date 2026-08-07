"use client"
import CatStateCards, { ICatStateCards } from "@/components/admin/categories/CatStateCards";
import Headers from "@/components/admin/common/Headers";
import { TicketList } from "@/components/admin/support/TicketList";
import { Download, RefreshCw } from "lucide-react";

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


      {/* <div className="flex h-screen w-full overflow-hidden">
        <div className="w-[30%] min-w-[280px]">
          <TicketList
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={setSelectedTicketId}
          />
        </div>
        <div className="w-[70%]">
          <TicketDetail ticket={selectedTicket} onUpdateTicket={handleUpdateTicket} />
        </div>
      </div> */}
    </div>
  );
}

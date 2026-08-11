export type TicketStatus = "Open" | "Closed" | "Under review" | "Resolved";
export type TicketPriority = "High" | "Medium" | "Low";
export type SenderRole = "user" | "admin";

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: SenderRole;
  date: string; // e.g. "Dec 22, 2024" or "Today"
  message: string;
}

export interface Ticket {
  id: string; // e.g. "SUP-001"
  subject: string;
  requesterName: string;
  requesterRole: string; // shown as a badge in the header, e.g. "Stylist Support"
  requesterInitials: string;
  category: "user" | "stylist" | "vendor" | "app"; // drives the left-list icon
  status: TicketStatus;
  priority: TicketPriority;
  filedDate: string;
  description: string; // the original ticket body, shown as the first highlighted bubble
  messages: TicketMessage[];
}

import { Ticket } from "@/types/ticket";

export const dummyTickets: Ticket[] = [
  {
    id: "SUP-001",
    subject: "Booking Issue",
    requesterName: "Amara Johnson",
    requesterRole: "Customer",
    requesterInitials: "AJ",
    category: "user",
    status: "Open",
    priority: "High",
    filedDate: "Dec 20, 2024",
    description:
      "I tried to book an appointment with my stylist but the payment kept failing even though my card has funds available.",
    messages: [
      {
        id: "m1",
        senderName: "Amara Johnson",
        senderRole: "user",
        date: "Dec 20, 2024",
        message:
          "I tried to book an appointment with my stylist but the payment kept failing even though my card has funds available.",
      },
    ],
  },
  {
    id: "SUP-002",
    subject: "Payout Delay",
    requesterName: "Kezia Okafor",
    requesterRole: "Stylist Support",
    requesterInitials: "KO",
    category: "stylist",
    status: "Open",
    priority: "High",
    filedDate: "Dec 22, 2024",
    description:
      "Payout for completed bookings BK-2398 and BK-2401 has not reflected in bank account after 5 business days.",
    messages: [
      {
        id: "m1",
        senderName: "Kezia Okafor",
        senderRole: "user",
        date: "Dec 22, 2024",
        message:
          "Payout for completed bookings BK-2398 and BK-2401 has not reflected in bank account after 5 business days.",
      },
      {
        id: "m2",
        senderName: "Admin",
        senderRole: "admin",
        date: "Today",
        message:
          "Thank you for reaching out. We are looking into this and will update you shortly. Your ticket has been escalated.",
      },
    ],
  },
  {
    id: "SUP-003",
    subject: "Product Not Approved",
    requesterName: "NaturalCurls Hub",
    requesterRole: "Vendor",
    requesterInitials: "NC",
    category: "vendor",
    status: "Under review",
    priority: "Medium",
    filedDate: "Dec 18, 2024",
    description:
      "Our new product listing for the Curl Defining Cream was rejected without a clear reason. Can you clarify what needs fixing?",
    messages: [
      {
        id: "m1",
        senderName: "NaturalCurls Hub",
        senderRole: "user",
        date: "Dec 18, 2024",
        message:
          "Our new product listing for the Curl Defining Cream was rejected without a clear reason. Can you clarify what needs fixing?",
      },
      {
        id: "m2",
        senderName: "Admin",
        senderRole: "admin",
        date: "Dec 19, 2024",
        message:
          "Thanks for flagging this. The listing images did not meet our resolution requirements. Please re-upload at 1200x1200px or higher.",
      },
    ],
  },
  {
    id: "SUP-004",
    subject: "OTP Not Received",
    requesterName: "Nkechi Obi",
    requesterRole: "Customer",
    requesterInitials: "NO",
    category: "user",
    status: "Open",
    priority: "Medium",
    filedDate: "Dec 23, 2024",
    description:
      "I've requested the OTP code five times now and nothing arrives via SMS or email. I can't log into my account.",
    messages: [
      {
        id: "m1",
        senderName: "Nkechi Obi",
        senderRole: "user",
        date: "Dec 23, 2024",
        message:
          "I've requested the OTP code five times now and nothing arrives via SMS or email. I can't log into my account.",
      },
    ],
  },
  {
    id: "SUP-005",
    subject: "App Crash on Login",
    requesterName: "Zara Williams",
    requesterRole: "Customer",
    requesterInitials: "ZW",
    category: "app",
    status: "Resolved",
    priority: "High",
    filedDate: "Dec 15, 2024",
    description:
      "The app crashes immediately every time I try to log in on my Android device, right after entering my password.",
    messages: [
      {
        id: "m1",
        senderName: "Zara Williams",
        senderRole: "user",
        date: "Dec 15, 2024",
        message:
          "The app crashes immediately every time I try to log in on my Android device, right after entering my password.",
      },
      {
        id: "m2",
        senderName: "Admin",
        senderRole: "admin",
        date: "Dec 16, 2024",
        message:
          "We identified a bug affecting Android devices on version 3.2.1. A fix has been shipped in version 3.2.2, please update the app.",
      },
      {
        id: "m3",
        senderName: "Zara Williams",
        senderRole: "user",
        date: "Dec 16, 2024",
        message: "Updated and it works now, thank you!",
      },
    ],
  },
  {
    id: "SUP-006",
    subject: "Video Upload Error",
    requesterName: "Funke Odeyemi",
    requesterRole: "Stylist Support",
    requesterInitials: "FO",
    category: "stylist",
    status: "Resolved",
    priority: "Low",
    filedDate: "Dec 10, 2024",
    description:
      "Portfolio videos over 30 seconds fail to upload and show a generic error message with no explanation.",
    messages: [
      {
        id: "m1",
        senderName: "Funke Odeyemi",
        senderRole: "user",
        date: "Dec 10, 2024",
        message:
          "Portfolio videos over 30 seconds fail to upload and show a generic error message with no explanation.",
      },
      {
        id: "m2",
        senderName: "Admin",
        senderRole: "admin",
        date: "Dec 11, 2024",
        message:
          "The upload limit was 30 seconds, we have now increased it to 90 seconds. Please try again.",
      },
    ],
  },
  {
    id: "SUP-007",
    subject: "Commission Query",
    requesterName: "BraidQueen Supply",
    requesterRole: "Vendor",
    requesterInitials: "BQ",
    category: "vendor",
    status: "Closed",
    priority: "Low",
    filedDate: "Dec 5, 2024",
    description:
      "Could you break down how the commission percentage is calculated on bundled product orders?",
    messages: [
      {
        id: "m1",
        senderName: "BraidQueen Supply",
        senderRole: "user",
        date: "Dec 5, 2024",
        message:
          "Could you break down how the commission percentage is calculated on bundled product orders?",
      },
      {
        id: "m2",
        senderName: "Admin",
        senderRole: "admin",
        date: "Dec 6, 2024",
        message:
          "Commission is calculated per line item at 12% before shipping, not on the bundle total. Closing this out, let us know if anything else comes up.",
      },
    ],
  },
];

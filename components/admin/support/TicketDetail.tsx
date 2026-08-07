"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, DollarSign, X, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Ticket, TicketMessage } from "@/types/ticket";
import { priorityStyles, statusStyles } from "@/lib/ticket-styles";
import { cn } from "@/lib/utils";

interface TicketDetailProps {
  ticket: Ticket | null;
  onUpdateTicket: (ticket: Ticket) => void;
}

const QUICK_REPLIES = [
  "We've received your request and are investigating.",
  "Your issue has been escalated to our technical team.",
  "The refund has been processed — 3-5 business days.",
  "Please update your app to the latest version.",
];

export function TicketDetail({ ticket, onUpdateTicket }: TicketDetailProps) {
  const [reply, setReply] = useState("");

  if (!ticket) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/20 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Select a ticket from the list to view details.
        </p>
      </div>
    );
  }

  const initials = ticket.requesterInitials;

  const appendMessage = (message: string) => {
    if (!message.trim()) return;
    const newMessage: TicketMessage = {
      id: `m-${Date.now()}`,
      senderName: "Admin",
      senderRole: "admin",
      date: "Today",
      message: message.trim(),
    };
    onUpdateTicket({
      ...ticket,
      messages: [...ticket.messages, newMessage],
    });
  };

  const handleSendReply = () => {
    appendMessage(reply);
    setReply("");
  };

  const handleStatusAction = (status: Ticket["status"]) => {
    onUpdateTicket({ ...ticket, status });
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-muted/20">
      <div className="w-full space-y-4 p-6">
        {/* Header card */}
        <div className="rounded-xl border bg-white p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-violet-700">
              {ticket.id}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                statusStyles[ticket.status]
              )}
            >
              {ticket.status}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                priorityStyles[ticket.priority]
              )}
            >
              {ticket.priority}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
              {ticket.requesterRole}
            </span>
          </div>

          <h2 className="mt-2 text-lg font-semibold text-foreground">
            {ticket.subject}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Filed {ticket.filedDate} · {ticket.messages.length - 1 > 0 ? ticket.messages.length - 1 : 0}{" "}
            replies
          </p>

          <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {ticket.description}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-900 text-xs font-semibold text-white">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {ticket.requesterName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ticket.requesterRole}
                </p>
              </div>
            </div>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Conversation */}
        <div className="rounded-xl border bg-white p-5">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Conversation
          </p>
          <div className="space-y-4">
            {ticket.messages.map((message) => {
              const isAdmin = message.senderRole === "admin";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-2.5",
                    isAdmin && "flex-row-reverse text-right"
                  )}
                >
                  {!isAdmin && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-900 text-xs font-semibold text-white">
                      {initials}
                    </div>
                  )}
                  <div className={cn("max-w-[80%]", isAdmin && "flex flex-col items-end")}>
                    <div className="flex items-center gap-2 text-xs">
                      {!isAdmin ? (
                        <>
                          <span className="font-medium text-violet-700">
                            {message.senderName}
                          </span>
                          <span className="text-muted-foreground">
                            · {message.date}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-violet-700">
                            Admin · {message.date}
                          </span>
                        </>
                      )}
                    </div>
                    <div
                      className={cn(
                        "mt-1 rounded-lg px-4 py-2.5 text-sm",
                        isAdmin
                          ? "bg-muted text-foreground"
                          : "bg-blue-50 text-blue-900"
                      )}
                    >
                      {message.message}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-900 text-xs font-semibold text-white">
                      S
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reply box */}
        <div className="rounded-xl border bg-white p-5">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Reply to User
          </p>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your response..."
            className="min-h-24 resize-none"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              onClick={handleSendReply}
              disabled={!reply.trim()}
              className="bg-violet-900 hover:bg-violet-800"
            >
              <Send className="mr-1.5 h-4 w-4" />
              Send Reply
            </Button>
            <Button
              variant="outline"
              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => handleStatusAction("Resolved")}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Resolve
            </Button>
            <Button
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
            >
              <DollarSign className="mr-1.5 h-4 w-4" />
              Issue Refund
            </Button>
            <Button
              variant="outline"
              className="text-muted-foreground"
              onClick={() => handleStatusAction("Closed")}
            >
              <X className="mr-1.5 h-4 w-4" />
              Close
            </Button>
          </div>

          <div className="mt-4 border-t pt-3">
            <p className="mb-2 text-xs text-muted-foreground">Quick replies:</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {QUICK_REPLIES.map((quickReply) => (
                <button
                  key={quickReply}
                  onClick={() => setReply(quickReply)}
                  className="truncate rounded-full border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted"
                  title={quickReply}
                >
                  {quickReply}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

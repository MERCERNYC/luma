
import type { LumaEmail } from "@/types/email";

// Fictional messages for Sophia's LUMA demo.
export const mockEmails: LumaEmail[] = [
  {
    id: "1",
    sender: "Project Manager",
    subject: "Project proposal approval",
    body: "Please review and approve the proposal today.",
    receivedAt: "2026-10-14T09:00:00",
    deadline: "2026-10-14T15:00:00",
    requiresAction: true,
    importantSender: true,
    isNewsletter: false,
  },
  {
    id: "2",
    sender: "School Office",
    subject: "Field trip permission form",
    body: "Please sign the permission form by the deadline.",
    receivedAt: "2026-10-14T08:30:00",
    deadline: "2026-10-14T23:59:00",
    requiresAction: true,
    importantSender: true,
    isNewsletter: false,
  },
  {
    id: "3",
    sender: "Pediatrician's Office",
    subject: "Appointment confirmation",
    body: "Please confirm your child's upcoming appointment.",
    receivedAt: "2026-10-14T08:00:00",
    requiresAction: true,
    importantSender: false,
    isNewsletter: false,
  },
  {
    id: "4",
    sender: "Community Center",
    subject: "Weekend activities",
    body: "See upcoming family activities this weekend.",
    receivedAt: "2026-10-14T07:30:00",
    requiresAction: false,
    importantSender: false,
    isNewsletter: true,
  },
  {
    id: "5",
    sender: "Online Store",
    subject: "Your order has shipped",
    body: "Your package is on its way.",
    receivedAt: "2026-10-14T07:00:00",
    requiresAction: false,
    importantSender: false,
    isNewsletter: false,
  },
];

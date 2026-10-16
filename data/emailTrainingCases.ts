
import type { LumaEmail } from "../types/email";
import type { EmailType } from "../lib/emailIntelligence";

export type TrainingCase = {
  email: LumaEmail;
  expectedType: EmailType;
  expectedAction: boolean;
};

export const trainingCases: TrainingCase[] = [
  {
    email: {
      id: "test-001",
      sender: "School Office",
      subject: "Permission form due Friday",
      body: "Please sign and return the field trip form.",
      receivedAt: "2026-10-16T09:00:00-04:00",
      deadline: "2026-10-16T17:00:00-04:00",
      requiresAction: true,
      importantSender: true,
      isNewsletter: false,
    },
    expectedType: "communication",
    expectedAction: true,
  },
  {
    email: {
      id: "test-002",
      sender: "Online Store",
      subject: "Your order has shipped",
      body: "Your package is on its way.",
      receivedAt: "2026-10-16T08:00:00-04:00",
      requiresAction: false,
      importantSender: false,
      isNewsletter: false,
    },
    expectedType: "notification",
    expectedAction: false,
  },
  {
    email: {
      id: "test-003",
      sender: "Project Manager",
      subject: "Proposal approval needed",
      body: "Please review and approve the proposal today.",
      receivedAt: "2026-10-16T10:00:00-04:00",
      deadline: "2026-10-16T15:00:00-04:00",
      requiresAction: true,
      importantSender: true,
      isNewsletter: false,
    },
    expectedType: "communication",
    expectedAction: true,
  },
  {
    email: {
      id: "test-004",
      sender: "Retail Store",
      subject: "Special offer this weekend",
      body: "Use your discount code to save.",
      receivedAt: "2026-10-16T11:00:00-04:00",
      requiresAction: false,
      importantSender: false,
      isNewsletter: false,
    },
    expectedType: "promotion",
    expectedAction: false,
  },
  {
    email: {
      id: "test-005",
      sender: "Unknown Sender",
      subject: "You won a prize",
      body: "Claim your reward now.",
      receivedAt: "2026-10-16T11:30:00-04:00",
      requiresAction: false,
      importantSender: false,
      isNewsletter: false,
    },
    expectedType: "potential_spam",
    expectedAction: false,
  },
];

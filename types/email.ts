
 // The three categories displayed on the LUMA dashboard.
export type EmailCategory =
  | "action"
  | "later"
  | "news";

// Describes the structure of one email.
export type LumaEmail = {
  id: string;
  sender: string;
  subject: string;
  body: string;
  receivedAt: string;

  // Optional deadline in ISO date format.
  deadline?: string;

  // Information used to calculate priority.
  requiresAction: boolean;
  importantSender: boolean;
  isNewsletter: boolean;

  // Category will be assigned by our sorting engine.
  category?: EmailCategory;
  priorityScore?: number;
};

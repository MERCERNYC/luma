
/**
 * LUMA — 50 Fictional Email Evaluation Cases
 * ------------------------------------------
 *
 * Purpose:
 * Evaluate LUMA's ability to:
 * 1. Recognize different email types.
 * 2. Detect whether an email requires action.
 * 3. Distinguish notifications from promotions.
 * 4. Identify potentially suspicious messages.
 * 5. Handle tricky or misleading language.
 *
 * These are fictional examples, not real Gmail data.
 *
 * IMPORTANT:
 * All input emails deliberately use:
 *
 *   requiresAction: false
 *
 * This prevents the existing manually supplied label
 * from revealing the expected answer to the engine.
 *
 * The expected values are stored separately and
 * should only be used by evaluation scripts.
 *
 * A passing result on this dataset does not prove
 * real-world accuracy or constitute AI training.
 */

import type { LumaEmail } from "@/types/email";
import type { EmailType } from "@/lib/emailIntelligence";

/**
 * Groups allow us to measure performance separately
 * across different kinds of email.
 */
export type EmailTestGroup =
  | "urgent_action"
  | "routine_notification"
  | "promotion"
  | "potential_spam"
  | "tricky_case";

/**
 * Ground-truth labels for a fictional email.
 *
 * expectedAction:
 * Whether the message actually requests an action.
 *
 * expectedType:
 * The intended email category, independent of
 * whether an action is required.
 *
 * expectedNeedsReview:
 * Whether LUMA should flag the message for
 * separate safety review.
 */
export type EmailTestCase = {
  id: string;
  group: EmailTestGroup;
  email: LumaEmail;
  expectedAction: boolean;
  expectedType: EmailType;
  expectedNeedsReview: boolean;
};

/**
 * Optional email metadata.
 *
 * We can provide deadlines and sender importance
 * without repeating every LumaEmail property.
 */
type TestOptions = {
  deadline?: string;
  importantSender?: boolean;
  isNewsletter?: boolean;
  receivedAt?: string;
};

/**
 * Create one complete evaluation case.
 *
 * Notice that the original requiresAction field
 * is ALWAYS false. The evaluation script must
 * compare the algorithm's detected action with
 * expectedAction instead.
 */
function makeCase(
  id: string,
  group: EmailTestGroup,
  sender: string,
  subject: string,
  body: string,
  expectedType: EmailType,
  expectedAction: boolean,
  options: TestOptions = {}
): EmailTestCase {
  return {
    id,
    group,

    email: {
      id,
      sender,
      subject,
      body,

      receivedAt:
        options.receivedAt ??
        "2026-10-19T12:00:00Z",

      ...(options.deadline
        ? { deadline: options.deadline }
        : {}),

      requiresAction: false,
      importantSender:
        options.importantSender ?? false,
      isNewsletter:
        options.isNewsletter ?? false,
    },

    expectedType,
    expectedAction,

    expectedNeedsReview:
      expectedType === "potential_spam",
  };
}

/**
 * GROUP A — URGENT ACTION REQUESTS
 *
 * 15 emails.
 *
 * These messages contain genuine tasks involving
 * work, school, family, housing, or finances.
 *
 * Some are easy to recognize. Others deliberately
 * avoid LUMA's current keyword patterns.
 */
const urgentActionCases: EmailTestCase[] = [
  makeCase(
    "A01",
    "urgent_action",
    "Project Manager",
    "Proposal approval needed",
    "Please review and approve the client proposal before 3 PM.",
    "communication",
    true,
    {
      importantSender: true,
      deadline: "2026-10-19T19:00:00Z",
    }
  ),

  makeCase(
    "A02",
    "urgent_action",
    "School Office",
    "Field trip permission form",
    "Please sign and return the permission form by tomorrow.",
    "communication",
    true,
    {
      importantSender: true,
      deadline: "2026-10-20T20:00:00Z",
    }
  ),

  makeCase(
    "A03",
    "urgent_action",
    "Pediatrician's Office",
    "Appointment confirmation",
    "Please confirm your child's appointment before the end of the day.",
    "notification",
    true
  ),

  makeCase(
    "A04",
    "urgent_action",
    "Team Lead",
    "Budget decision",
    "We need your decision on the revised budget today.",
    "communication",
    true,
    { importantSender: true }
  ),

  makeCase(
    "A05",
    "urgent_action",
    "Teacher",
    "Parent meeting",
    "Can you let me know whether Thursday at 4 PM works for you?",
    "communication",
    true
  ),

  makeCase(
    "A06",
    "urgent_action",
    "Property Manager",
    "Water leak reported",
    "A water leak was reported in unit 204. Please respond today.",
    "communication",
    true,
    { importantSender: true }
  ),

  makeCase(
    "A07",
    "urgent_action",
    "Accounting Department",
    "Invoice awaiting approval",
    "The contractor invoice is awaiting your approval before payment.",
    "communication",
    true
  ),

  makeCase(
    "A08",
    "urgent_action",
    "Tennis Coach",
    "Practice attendance",
    "Please reply to confirm whether Lucas will attend practice.",
    "communication",
    true
  ),

  makeCase(
    "A09",
    "urgent_action",
    "HR Department",
    "Benefits enrollment deadline",
    "Complete your benefits enrollment before the deadline tonight.",
    "notification",
    true,
    {
      deadline: "2026-10-20T03:59:00Z",
    }
  ),

  makeCase(
    "A10",
    "urgent_action",
    "School Portal",
    "Emergency contact update",
    "Your child's emergency contact information must be updated by Friday.",
    "notification",
    true
  ),

  makeCase(
    "A11",
    "urgent_action",
    "Client",
    "Contract revision",
    "Could you send the updated contract before our meeting?",
    "communication",
    true,
    { importantSender: true }
  ),

  makeCase(
    "A12",
    "urgent_action",
    "Dentist Office",
    "New patient paperwork",
    "Please complete the patient forms before your appointment.",
    "notification",
    true
  ),

  makeCase(
    "A13",
    "urgent_action",
    "School Principal",
    "Transportation decision",
    "We need your choice of bus transportation or parent pickup by Wednesday.",
    "communication",
    true,
    { importantSender: true }
  ),

  makeCase(
    "A14",
    "urgent_action",
    "Finance Team",
    "Expense report correction",
    "Your expense report was returned. Correct the missing receipt and resubmit it.",
    "notification",
    true
  ),

  makeCase(
    "A15",
    "urgent_action",
    "Building Maintenance",
    "Urgent maintenance authorization",
    "Please authorize the emergency plumbing repair today.",
    "communication",
    true,
    { importantSender: true }
  ),
];

/**
 * GROUP B — ROUTINE NOTIFICATIONS
 *
 * 10 emails.
 *
 * These messages provide useful information
 * but do not ask Sophia to complete a task.
 *
 * LUMA should not automatically classify
 * ordinary notifications as spam.
 */
const routineNotificationCases: EmailTestCase[] = [
  makeCase(
    "N01",
    "routine_notification",
    "Online Store",
    "Your order has shipped",
    "Your package is on its way. Tracking is available.",
    "notification",
    false
  ),

  makeCase(
    "N02",
    "routine_notification",
    "Delivery Service",
    "Delivery update",
    "Your package is expected to arrive tomorrow.",
    "notification",
    false
  ),

  makeCase(
    "N03",
    "routine_notification",
    "Pediatrician's Office",
    "Appointment reminder",
    "This is a reminder of your appointment. No response is needed.",
    "notification",
    false
  ),

  makeCase(
    "N04",
    "routine_notification",
    "School Newsletter",
    "Weekly school news",
    "Here are this week's classroom highlights and photos.",
    "notification",
    false,
    { isNewsletter: true }
  ),

  makeCase(
    "N05",
    "routine_notification",
    "Bank",
    "Monthly statement available",
    "Your monthly account statement is ready to view.",
    "notification",
    false
  ),

  makeCase(
    "N06",
    "routine_notification",
    "Library",
    "Library event calendar",
    "Explore upcoming reading events for families.",
    "notification",
    false,
    { isNewsletter: true }
  ),

  makeCase(
    "N07",
    "routine_notification",
    "Calendar",
    "Meeting reminder",
    "Your team meeting begins tomorrow at 10 AM.",
    "notification",
    false
  ),

  makeCase(
    "N08",
    "routine_notification",
    "School Office",
    "School lunch menu",
    "The cafeteria menu for next week is now available.",
    "notification",
    false,
    { isNewsletter: true }
  ),

  makeCase(
    "N09",
    "routine_notification",
    "Cloud Storage",
    "Backup completed",
    "Your files were backed up successfully.",
    "notification",
    false
  ),

  makeCase(
    "N10",
    "routine_notification",
    "Community Center",
    "Weekend activities",
    "See the schedule of family activities this weekend.",
    "notification",
    false,
    { isNewsletter: true }
  ),
];

/**
 * GROUP C — PROMOTIONS
 *
 * 10 emails.
 *
 * These are advertisements and marketing offers.
 * Urgency in marketing language should not be
 * confused with a genuine personal deadline.
 */
const promotionCases: EmailTestCase[] = [
  makeCase(
    "P01",
    "promotion",
    "Clothing Store",
    "Special offer this weekend",
    "Enjoy 20% off selected items.",
    "promotion",
    false
  ),

  makeCase(
    "P02",
    "promotion",
    "Shoe Store",
    "Sale ends tonight",
    "Shop our latest collection before the sale ends.",
    "promotion",
    false
  ),

  makeCase(
    "P03",
    "promotion",
    "Online Retailer",
    "Discount code inside",
    "Use SAVE20 at checkout for a limited-time discount.",
    "promotion",
    false
  ),

  makeCase(
    "P04",
    "promotion",
    "Home Decor Shop",
    "New arrivals",
    "Discover our new fall home collection.",
    "promotion",
    false
  ),

  makeCase(
    "P05",
    "promotion",
    "Fitness Studio",
    "Membership promotion",
    "Join this month and receive a free introductory class.",
    "promotion",
    false
  ),

  makeCase(
    "P06",
    "promotion",
    "Beauty Brand",
    "Exclusive skincare deal",
    "Our skincare products are 25% off this week.",
    "promotion",
    false
  ),

  makeCase(
    "P07",
    "promotion",
    "Travel Company",
    "Flash travel sale",
    "Book your next vacation at a reduced price.",
    "promotion",
    false
  ),

  makeCase(
    "P08",
    "promotion",
    "Furniture Store",
    "Last chance to save",
    "Our seasonal furniture promotion ends at midnight.",
    "promotion",
    false
  ),

  makeCase(
    "P09",
    "promotion",
    "Coffee Subscription",
    "A gift for you",
    "Subscribe today and receive your first bag free.",
    "promotion",
    false
  ),

  makeCase(
    "P10",
    "promotion",
    "Electronics Shop",
    "Upgrade your laptop",
    "Browse this week's laptop deals and bundles.",
    "promotion",
    false
  ),
];

/**
 * GROUP D — POTENTIAL SPAM OR PHISHING
 *
 * 5 emails.
 *
 * These messages contain suspicious requests.
 *
 * Expected behavior:
 * - Flag for separate review.
 * - Do not promote into the normal Top 3.
 * - Never automatically click links or delete.
 *
 * The examples are intentionally fictional
 * and contain no real malicious links.
 */
const spamCases: EmailTestCase[] = [
  makeCase(
    "S01",
    "potential_spam",
    "Unknown Prize Center",
    "You won a prize",
    "Claim your reward immediately by sharing personal information.",
    "potential_spam",
    false
  ),

  makeCase(
    "S02",
    "potential_spam",
    "Account Verification",
    "Verify your password",
    "Your account will close unless you send us your password.",
    "potential_spam",
    false
  ),

  makeCase(
    "S03",
    "potential_spam",
    "Unknown Sender",
    "Urgent payment demand",
    "Send a gift card code now to prevent account suspension.",
    "potential_spam",
    false
  ),

  makeCase(
    "S04",
    "potential_spam",
    "Fake Support Team",
    "Security warning",
    "Provide your login credentials to restore access immediately.",
    "potential_spam",
    false
  ),

  makeCase(
    "S05",
    "potential_spam",
    "Unexpected Payment Notice",
    "Unclaimed refund",
    "Pay a processing fee to receive a refund you did not request.",
    "potential_spam",
    false
  ),
];

/**
 * GROUP E — TRICKY CASES
 *
 * 10 emails.
 *
 * These cases test the difference between:
 * - Actual requests and quoted requests
 * - Automated notifications and actionable tasks
 * - Marketing urgency and real urgency
 * - Completed tasks and unfinished tasks
 *
 * These are especially useful for identifying
 * weaknesses in keyword-only classification.
 */
const trickyCases: EmailTestCase[] = [
  makeCase(
    "T01",
    "tricky_case",
    "School Portal",
    "Permission form still missing",
    "Automated reminder: the signed permission form has not been received. Submit it before Friday.",
    "notification",
    true
  ),

  makeCase(
    "T02",
    "tricky_case",
    "Appointment System",
    "Appointment confirmation",
    "Your appointment is confirmed. No reply or further action is needed.",
    "notification",
    false
  ),

  makeCase(
    "T03",
    "tricky_case",
    "Project Manager",
    "Proposal approved",
    "Thanks for your work. The proposal has already been approved. No further review is required.",
    "communication",
    false
  ),

  makeCase(
    "T04",
    "tricky_case",
    "Marketing Team",
    "Please reply for your discount",
    "Please reply YES if you would like to receive our special offer.",
    "promotion",
    false
  ),

  makeCase(
    "T05",
    "tricky_case",
    "School Office",
    "Important school announcement",
    "School will be closed on Friday because of a staff development day.",
    "notification",
    false
  ),

  makeCase(
    "T06",
    "tricky_case",
    "Client",
    "Quick question about tomorrow",
    "Are you available to move our meeting to 2 PM?",
    "communication",
    true
  ),

  makeCase(
    "T07",
    "tricky_case",
    "Billing System",
    "Payment unsuccessful",
    "Your scheduled payment failed. Update your payment method to avoid interruption.",
    "notification",
    true
  ),

  makeCase(
    "T08",
    "tricky_case",
    "Online Store",
    "Order delivered",
    "Your order was delivered successfully. Please review your purchase if you wish.",
    "notification",
    false
  ),

  makeCase(
    "T09",
    "tricky_case",
    "Team Lead",
    "Meeting notes",
    "Here are the meeting notes. The action items have already been completed.",
    "communication",
    false
  ),

  makeCase(
    "T10",
    "tricky_case",
    "School Office",
    "Emergency contact verification",
    "Our records show a missing emergency contact number. Add the number in the parent portal today.",
    "notification",
    true
  ),
];

/**
 * FINAL DATASET
 *
 * Combines all five groups into one array.
 *
 * Expected total:
 * 15 + 10 + 10 + 5 + 10 = 50
 */
export const emailTestCases: EmailTestCase[] = [
  ...urgentActionCases,
  ...routineNotificationCases,
  ...promotionCases,
  ...spamCases,
  ...trickyCases,
];

/**
 * Convenience export for running the algorithm
 * against the fictional email messages.
 *
 * Never use expectedAction or expectedType
 * as input features for the intelligence engine.
 */
export const evaluationEmails: LumaEmail[] =
  emailTestCases.map((testCase) => testCase.email);

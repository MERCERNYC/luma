/**
 * LUMA — Independent Email Evaluation Set
 * ---------------------------------------
 *
 * 30 NEW fictional emails.
 *
 * Purpose:
 * Test whether LUMA's current rules generalize
 * beyond the original 50 development examples.
 *
 * DO NOT:
 * - Add these emails to emailTestCases.ts
 * - Use their expected labels in classification
 * - Change these labels after seeing predictions
 * - Tune the algorithm before saving baseline results
 *
 * This is a holdout evaluation, not AI training.
 */

import type { LumaEmail } from "../types/email";
import type { EmailType } from "../lib/emailIntelligence";

export type HoldoutGroup =
  | "subtle_action"
  | "routine_notification"
  | "misleading_promotion"
  | "potential_phishing"
  | "mixed_context";

export type HoldoutCase = {
  id: string;
  group: HoldoutGroup;
  email: LumaEmail;
  expectedType: EmailType;
  expectedAction: boolean;
  expectedNeedsReview: boolean;
};

type CaseOptions = {
  importantSender?: boolean;
  isNewsletter?: boolean;
  deadline?: string;
};

/**
 * Build a test case with its expected answers
 * stored separately from the input email.
 *
 * requiresAction is always false in the input,
 * preventing ground-truth label leakage.
 */
function makeCase(
  id: string,
  group: HoldoutGroup,
  sender: string,
  subject: string,
  body: string,
  expectedType: EmailType,
  expectedAction: boolean,
  options: CaseOptions = {}
): HoldoutCase {
  return {
    id,
    group,
    email: {
      id,
      sender,
      subject,
      body,
      receivedAt: "2026-10-19T15:00:00Z",
      requiresAction: false,
      importantSender: options.importantSender ?? false,
      isNewsletter: options.isNewsletter ?? false,
      ...(options.deadline
        ? { deadline: options.deadline }
        : {}),
    },
    expectedType,
    expectedAction,
    expectedNeedsReview:
      expectedType === "potential_spam",
  };
}

// ==================================================
// GROUP A — 10 SUBTLE ACTION REQUESTS
// ==================================================
//
// Genuine requests that use less obvious wording.
// Several do not contain "please reply", "sign",
// "approve", or LUMA's existing action phrases.

const subtleActions: HoldoutCase[] = [
  makeCase(
    "H01",
    "subtle_action",
    "Operations Director",
    "Thursday meeting",
    "Thursday morning is booked on my end. Would 2:30 PM work for you instead?",
    "communication",
    true
  ),

  makeCase(
    "H02",
    "subtle_action",
    "Leasing Coordinator",
    "Lease addendum pending",
    "The revised lease is ready in the portal, but it cannot be finalized until your electronic signature is in place.",
    "communication",
    true,
    { importantSender: true }
  ),

  makeCase(
    "H03",
    "subtle_action",
    "Accounting",
    "October invoice discrepancy",
    "The invoice includes two extra hours. Could you check the line items and tell us which total is correct?",
    "communication",
    true
  ),

  makeCase(
    "H04",
    "subtle_action",
    "School Coordinator",
    "Wednesday pickup arrangements",
    "We're missing an approved backup contact for Wednesday. Who should we list for pickup?",
    "communication",
    true
  ),

  makeCase(
    "H05",
    "subtle_action",
    "Benefits Portal",
    "Dependent information incomplete",
    "Your coverage may lapse unless the dependent details are corrected before Friday.",
    "notification",
    true,
    { deadline: "2026-10-23T20:00:00Z" }
  ),

  makeCase(
    "H06",
    "subtle_action",
    "Creative Team",
    "Artwork ready for production",
    "Production is paused pending your green light on the final artwork.",
    "communication",
    true
  ),

  makeCase(
    "H07",
    "subtle_action",
    "Parent Volunteer Coordinator",
    "One shift remaining",
    "We have an open classroom volunteer shift Tuesday afternoon. Can you take it?",
    "communication",
    true
  ),

  makeCase(
    "H08",
    "subtle_action",
    "School Lunch Portal",
    "Cafeteria balance is low",
    "The lunch account is below the minimum for Monday. Funds need to be added before school starts.",
    "notification",
    true
  ),

  makeCase(
    "H09",
    "subtle_action",
    "Product Manager",
    "Shared folder access",
    "Mina cannot open the project folder. Would you grant her editor access?",
    "communication",
    true
  ),

  makeCase(
    "H10",
    "subtle_action",
    "Vendor Relations",
    "Renewal choice",
    "Our renewal window closes tomorrow. Which of the two service plans should we proceed with?",
    "communication",
    true,
    { importantSender: true }
  ),
];

// ==================================================
// GROUP B — 6 ROUTINE NOTIFICATIONS
// ==================================================
//
// These messages contain information, not tasks.
// Some contain wording that could mislead a
// simple keyword-based detector.

const routineNotifications: HoldoutCase[] = [
  makeCase(
    "H11",
    "routine_notification",
    "Parcel Service",
    "Parcel placed in locker",
    "Your parcel was placed in locker 18 at 10:42 AM. This is a delivery status notice.",
    "notification",
    false
  ),

  makeCase(
    "H12",
    "routine_notification",
    "Sports Club",
    "Practice schedule notice",
    "Soccer practice begins at 5 PM. The coach already has everyone's attendance information.",
    "notification",
    false
  ),

  makeCase(
    "H13",
    "routine_notification",
    "Payment Processor",
    "Receipt for your records",
    "Your payment was received successfully. This receipt is for your records.",
    "notification",
    false
  ),

  makeCase(
    "H14",
    "routine_notification",
    "School Transportation",
    "Bus route running late",
    "Route 4 is about 12 minutes behind schedule. Pickup arrangements remain unchanged.",
    "notification",
    false
  ),

  makeCase(
    "H15",
    "routine_notification",
    "Document Portal",
    "Agreement fully executed",
    "All parties have signed the agreement. Nothing remains for you to complete.",
    "notification",
    false
  ),

  makeCase(
    "H16",
    "routine_notification",
    "Team Activity Digest",
    "Yesterday's completed tasks",
    "The archived task list included 'Please approve the budget' and 'Please reply to the vendor.' Both tasks were completed yesterday.",
    "notification",
    false
  ),
];

// ==================================================
// GROUP C — 6 MISLEADING PROMOTIONS
// ==================================================
//
// Marketing messages that use urgency,
// personalized language, or direct requests.
//
// None represents a necessary personal task.

const misleadingPromotions: HoldoutCase[] = [
  makeCase(
    "H17",
    "misleading_promotion",
    "Lifestyle Brand",
    "Your invitation expires at midnight",
    "Reserve a complimentary product demonstration today. This invitation is available for a limited time.",
    "promotion",
    false
  ),

  makeCase(
    "H18",
    "misleading_promotion",
    "Candle Company",
    "A personal note from our founder",
    "We've been making candles for ten years. Explore our autumn collection and discover something new.",
    "promotion",
    false,
    { isNewsletter: true }
  ),

  makeCase(
    "H19",
    "misleading_promotion",
    "Sneaker Boutique",
    "Only a few pairs left",
    "Popular sizes are disappearing quickly. Order your favorite sneakers while inventory remains.",
    "promotion",
    false
  ),

  makeCase(
    "H20",
    "misleading_promotion",
    "Card Marketing",
    "Your personal savings opportunity",
    "Discover how much you could save with our new rewards card. Applications are open now.",
    "promotion",
    false
  ),

  makeCase(
    "H21",
    "misleading_promotion",
    "Beauty Newsletter",
    "Please confirm your interest",
    "Please confirm if you'd like to receive promotional messages and a welcome coupon. Joining is entirely optional.",
    "promotion",
    false
  ),

  makeCase(
    "H22",
    "misleading_promotion",
    "Software Marketing",
    "Final notice about your trial",
    "Your free trial ends tonight. Upgrade for extra features, or simply let the trial expire without taking any action.",
    "promotion",
    false,
    { isNewsletter: true }
  ),
];

// ==================================================
// GROUP D — 6 POTENTIAL PHISHING ATTEMPTS
// ==================================================
//
// Fictional messages containing suspicious
// requests or signs of impersonation.
//
// Correct behavior:
// Flag for separate review, not Top 3.
//
// No real links, accounts, or credentials appear
// in these examples.
//
// expectedAction=false means there is no
// legitimate task LUMA should recommend.
// It does not mean the text lacks instructions.

const potentialPhishing: HoldoutCase[] = [
  makeCase(
    "H23",
    "potential_phishing",
    "Mailbox Administrator",
    "Mailbox access suspended",
    "Your mailbox has been locked. Enter your email password into the attached form to restore service.",
    "potential_spam",
    false
  ),

  makeCase(
    "H24",
    "potential_phishing",
    "Payroll Helpdesk",
    "Payroll routing details",
    "Before payday, enter your bank account and routing numbers into the unfamiliar form attached to this message.",
    "potential_spam",
    false
  ),

  makeCase(
    "H25",
    "potential_phishing",
    "Executive Office",
    "Confidential favor",
    "I'm in a meeting. Purchase five prepaid cards and send photographs of the codes. Keep this confidential.",
    "potential_spam",
    false
  ),

  makeCase(
    "H26",
    "potential_phishing",
    "Tax Rebate Center",
    "Unexpected tax rebate",
    "A tax rebate is waiting for you. First transfer a small release charge to receive the funds.",
    "potential_spam",
    false
  ),

  makeCase(
    "H27",
    "potential_phishing",
    "Security Notification",
    "Unrecognized device sign-in",
    "A device signed into your account. Open the attached HTML file and enter your one-time login code.",
    "potential_spam",
    false
  ),

  makeCase(
    "H28",
    "potential_phishing",
    "Vendor Accounts",
    "New banking instructions",
    "Our bank details have changed. Wire today's invoice to the replacement account in the attachment. Do not call our previous contact.",
    "potential_spam",
    false
  ),
];

// ==================================================
// GROUP E — 2 MIXED-CONTEXT EMAILS
// ==================================================
//
// Test whether LUMA can distinguish a historical
// or quoted request from a current request.

const mixedContext: HoldoutCase[] = [
  makeCase(
    "H29",
    "mixed_context",
    "Project Coordinator",
    "Meeting minutes recap",
    "Last week's agenda said 'please review the proposal.' Alex finished that item on Friday. This email is only a recap.",
    "communication",
    false
  ),

  makeCase(
    "H30",
    "mixed_context",
    "School Administrator",
    "Early-release calendar correction",
    "The date shown in the parent portal is incorrect. Which afternoon would you prefer for your child's pickup arrangement?",
    "communication",
    true
  ),
];

// ==================================================
// COMPLETE INDEPENDENT EVALUATION DATASET
// ==================================================

export const emailHoldoutCases: HoldoutCase[] = [
  ...subtleActions,
  ...routineNotifications,
  ...misleadingPromotions,
  ...potentialPhishing,
  ...mixedContext,
];

/**
 * Optional convenience export.
 *
 * Contains only the input emails, never the
 * expected labels used to grade predictions.
 */
export const holdoutEmails: LumaEmail[] =
  emailHoldoutCases.map((testCase) => testCase.email);

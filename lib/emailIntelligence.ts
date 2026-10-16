
import type { LumaEmail } from "../types/email";
import { detectAction } from "./detectAction";

// The four types of email LUMA recognizes.
export type EmailType =
  | "communication"
  | "notification"
  | "promotion"
  | "potential_spam";

// The result of LUMA analyzing one email.
export type EmailDecision = {
  email: LumaEmail;
  type: EmailType;
  requiresAction: boolean;
  score: number;
  needsReview: boolean;
  reason: string;
};

// Checks whether text contains any matching phrase.
function includesAny(
  text: string,
  phrases: string[]
): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

// Analyze one email.
export function evaluateEmail(
  email: LumaEmail,
  now: Date
): EmailDecision {
  const content =
    `${email.subject} ${email.body}`.toLowerCase();

  // STAGE 1: CLASSIFY THE EMAIL TYPE

  const suspicious = includesAny(content, [
    "you won a prize",
    "claim your reward",
    "verify your password",
  ]);

  const promotional = includesAny(content, [
    "special offer",
    "sale ends",
    "discount code",
  ]);

  const notification = includesAny(content, [
    "your order has shipped",
    "delivery update",
    "appointment reminder",
    "appointment confirmation",
  ]);

  let type: EmailType = "communication";

  if (suspicious) {
    type = "potential_spam";
  } else if (promotional) {
    type = "promotion";
  } else if (notification || email.isNewsletter) {
    type = "notification";
  }

  // STAGE 2: AUTOMATIC ACTION DETECTION

  // LUMA reads the email instead of trusting
  // the manually supplied requiresAction label.
  const action = detectAction(email);
  const requiresAction = action.requiresAction;

  // STAGE 3: CALCULATE PRIORITY

  let score = 0;
  const reasons: string[] = [];

  if (requiresAction) {
    score += 35;
    reasons.push("Action required");
  }

  if (email.importantSender) {
    score += 20;
    reasons.push("Important sender");
  }

  // Deadlines affect priority only when
  // LUMA detects an action to complete.
  if (requiresAction && email.deadline) {
    const deadlineMs = new Date(email.deadline).getTime();

    if (Number.isFinite(deadlineMs)) {
      const hoursUntil =
        (deadlineMs - now.getTime()) / 3_600_000;

      if (hoursUntil < 0) {
        score += 60;
        reasons.push("Deadline overdue");
      } else if (hoursUntil <= 24) {
        score += 50;
        reasons.push("Due within 24 hours");
      } else if (hoursUntil <= 72) {
        score += 30;
        reasons.push("Due within 3 days");
      }
    }
  }

  // Recently received emails receive a small bonus.
  const receivedMs = new Date(email.receivedAt).getTime();

  if (Number.isFinite(receivedMs)) {
    const hoursOld =
      (now.getTime() - receivedMs) / 3_600_000;

    if (hoursOld >= 0 && hoursOld <= 6) {
      score += 5;
    }
  }

  // Routine promotions are less important.
  if (type === "promotion" && !requiresAction) {
    score -= 30;
  }

  // Potential spam requires separate review.
  // LUMA must never automatically delete it.
  const needsReview = type === "potential_spam";

  // STAGE 4: EXPLAIN THE DECISION

  let reason: string;

  if (needsReview) {
    reason =
      "Potentially suspicious message. Review safely before taking action.";
  } else if (requiresAction) {
    reason = [
      action.reason,
      ...reasons.filter((item) => item !== "Action required"),
    ].join(" ");
  } else if (reasons.length > 0) {
    reason = reasons.join("; ");
  } else {
    reason = "No explicit action request detected.";
  }

  return {
    email,
    type,
    requiresAction,
    score,
    needsReview,
    reason,
  };
}

// STAGE 5: SORT EMAILS BY PRIORITY

export function prioritizeEmails(
  emails: LumaEmail[],
  now: Date
): EmailDecision[] {
  return emails
    .map((email) => evaluateEmail(email, now))
    .sort((a, b) => {
      // Suspicious emails go to separate review.
      if (a.needsReview !== b.needsReview) {
        return a.needsReview ? 1 : -1;
      }

      // Emails requiring action come first.
      if (a.requiresAction !== b.requiresAction) {
        return a.requiresAction ? -1 : 1;
      }

      // Higher priority score comes first.
      if (a.score !== b.score) {
        return b.score - a.score;
      }

      // If scores match, newest email comes first.
      const aTime = new Date(a.email.receivedAt).getTime();
      const bTime = new Date(b.email.receivedAt).getTime();

      const timeDifference =
        (Number.isFinite(bTime) ? bTime : 0) -
        (Number.isFinite(aTime) ? aTime : 0);

      if (timeDifference !== 0) {
        return timeDifference;
      }

      // Final deterministic tie-breaker.
      return a.email.id.localeCompare(b.email.id);
    });
}

  
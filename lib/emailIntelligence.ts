
import type { LumaEmail } from "../types/email";
import { detectAction } from "./detectAction";

/**
 * LUMA — Email Intelligence Engine
 *
 * Separates three independent decisions:
 *
 * 1. What type of email is this?
 * 2. Does it require a legitimate action?
 * 3. How high should it rank?
 *
 * Suspicious messages are excluded from the
 * normal focus list and require safe review.
 */

export type EmailType =
  | "communication"
  | "notification"
  | "promotion"
  | "potential_spam";

export type EmailDecision = {
  email: LumaEmail;
  type: EmailType;
  requiresAction: boolean;
  score: number;
  needsReview: boolean;
  reason: string;
};

function includesAny(
  text: string,
  phrases: string[]
): boolean {
  return phrases.some((phrase) =>
    text.includes(phrase)
  );
}

/**
 * CLASSIFICATION
 *
 * Order matters:
 * 1. Suspicious content
 * 2. Promotions
 * 3. Notifications
 * 4. Regular communication
 *
 * These phrase lists are evaluation baselines,
 * not production-grade spam detection.
 */
function classifyEmail(email: LumaEmail): EmailType {
  const text =
    `${email.subject} ${email.body}`.toLowerCase();

  const suspicious = includesAny(text, [
    "you won a prize",
    "claim your reward",
    "verify your password",
    "send us your password",
    "send a gift card code",
    "provide your login credentials",
    "pay a processing fee",
  ]);

  if (suspicious) {
    return "potential_spam";
  }

  const promotional = includesAny(text, [
    "special offer",
    "sale ends",
    "discount code",
    "new arrivals",
    "membership promotion",
    "skincare deal",
    "flash travel sale",
    "last chance to save",
    "a gift for you",
    "laptop deals",
  ]);

  if (promotional) {
    return "promotion";
  }

  const notification = includesAny(text, [
    "your order has shipped",
    "delivery update",
    "appointment reminder",
    "appointment confirmation",
    "benefits enrollment",
    "emergency contact update",
    "emergency contact verification",
    "new patient paperwork",
    "expense report correction",
    "monthly statement available",
    "meeting reminder",
    "backup completed",
    "automated reminder",
    "school will be closed",
    "payment unsuccessful",
    "order delivered",
  ]);

  if (notification || email.isNewsletter) {
    return "notification";
  }

  return "communication";
}

/**
 * EVALUATE ONE EMAIL
 *
 * Uses classification, action detection,
 * sender importance, deadlines, and recency.
 */
export function evaluateEmail(
  email: LumaEmail,
  now: Date
): EmailDecision {
  const type = classifyEmail(email);
  const needsReview = type === "potential_spam";

  const action = detectAction(email);

  /**
   * Suspicious requests are not treated as
   * legitimate tasks for the Top 3.
   *
   * Example:
   * "Send us your password immediately"
   * is a request, but not one LUMA should
   * recommend completing.
   */
  const requiresAction =
    !needsReview && action.requiresAction;

  let score = 0;
  const reasons: string[] = [];

  if (requiresAction) {
    score += 35;
    reasons.push(action.reason);
  }

  if (email.importantSender) {
    score += 20;
    reasons.push("Important sender");
  }

  /**
   * Deadlines increase priority only when
   * a legitimate action has been detected.
   *
   * Invalid deadline values are ignored.
   */
  if (requiresAction && email.deadline) {
    const deadlineMs =
      new Date(email.deadline).getTime();

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

  /**
   * Recency is a small tie-breaking signal.
   * It should not outweigh a real deadline.
   */
  const receivedMs =
    new Date(email.receivedAt).getTime();

  if (Number.isFinite(receivedMs)) {
    const hoursOld =
      (now.getTime() - receivedMs) / 3_600_000;

    if (hoursOld >= 0 && hoursOld <= 6) {
      score += 5;
    }
  }

  // Routine advertisements should not
  // compete with genuine action requests.
  if (type === "promotion" && !requiresAction) {
    score -= 30;
  }

  /**
   * Explanations are based on actual rules.
   * Do not invent a deadline or action.
   */
  const reason = needsReview
    ? "Potentially suspicious message. Review safely."
    : reasons.length > 0
      ? reasons.join("; ")
      : action.reason;

  return {
    email,
    type,
    requiresAction,
    score,
    needsReview,
    reason,
  };
}

/**
 * PRIORITIZE EMAILS
 *
 * Ranking order:
 * 1. Safe-to-review emails before suspicious ones
 * 2. Actionable emails before non-actionable ones
 * 3. Higher scores first
 * 4. Newer messages first
 * 5. Stable ID tie-breaker
 *
 * Suspicious messages are not deleted.
 * The dashboard must keep them out of Top 3.
 */
export function prioritizeEmails(
  emails: LumaEmail[],
  now: Date
): EmailDecision[] {
  return emails
    .map((email) => evaluateEmail(email, now))
    .sort((a, b) => {
      if (a.needsReview !== b.needsReview) {
        return a.needsReview ? 1 : -1;
      }

      if (a.requiresAction !== b.requiresAction) {
        return a.requiresAction ? -1 : 1;
      }

      if (a.score !== b.score) {
        return b.score - a.score;
      }

      const aTime =
        new Date(a.email.receivedAt).getTime();

      const bTime =
        new Date(b.email.receivedAt).getTime();

      const timeDifference =
        (Number.isFinite(bTime) ? bTime : 0) -
        (Number.isFinite(aTime) ? aTime : 0);

      if (timeDifference !== 0) {
        return timeDifference;
      }

      return a.email.id.localeCompare(b.email.id);
    });
}

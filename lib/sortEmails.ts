import type {
  EmailCategory,
  LumaEmail,
} from "@/types/email";

// Calculates priority using simple, explainable rules.
export function scoreEmail(
  email: LumaEmail,
  now: Date
): number {
  let score = 0;

  // Emails requiring a response receive more points.
  if (email.requiresAction) {
    score += 50;
  }

  // Important senders receive extra points (enough to reach "action" on their own).
  if (email.importantSender) {
    score += 50;
  }

  // Emails with approaching deadlines are more urgent.
  if (email.deadline) {
    const hoursUntilDeadline =
      (new Date(email.deadline).getTime() - now.getTime()) /
      (1000 * 60 * 60);

    if (hoursUntilDeadline < 0) {
      score += 50; // Overdue — treated as urgently as requiresAction
    } else if (hoursUntilDeadline <= 24) {
      score += 30; // Due within 24 hours
    } else if (hoursUntilDeadline <= 72) {
      score += 15; // Due within 3 days
    }
  }

  // Recency bonus: newer emails rank higher when other signals are equal.
  const hoursOld =
    (now.getTime() - new Date(email.receivedAt).getTime()) / (1000 * 60 * 60);
  if (hoursOld <= 1) {
    score += 10;
  } else if (hoursOld <= 6) {
    score += 5;
  } else if (hoursOld <= 24) {
    score += 2;
  }

  return score;
}

// Assigns one of our three dashboard categories.

export function categorizeEmail(
  email: LumaEmail,
  score: number
): EmailCategory {
  // A message requiring action belongs in Action Needed.
  if (email.requiresAction) {
    return "action";
  }

  // Newsletters without action requests go to News.
  if (email.isNewsletter) {
    return "news";
  }

  // Important FYI emails can rank highly in For Later.
  return "later";
}


// Scores, categorizes, and sorts emails by priority.
export function sortEmails(
  emails: LumaEmail[],
  now: Date
): LumaEmail[] {
  return emails
    .map((email) => {
      const priorityScore = scoreEmail(email, now);

      return {
        ...email,
        priorityScore,
        category: categorizeEmail(email, priorityScore),
      };
    })
    .sort((a, b) => {
      const scoreDiff = (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      // Tie-break: newer emails first.
      return (
        new Date(b.receivedAt).getTime() -
        new Date(a.receivedAt).getTime()
      );
    });
}

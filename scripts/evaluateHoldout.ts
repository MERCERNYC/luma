
/**
 * LUMA — Independent Holdout Evaluation
 * -------------------------------------
 *
 * Evaluates 30 new fictional emails using
 * the current, unchanged intelligence engine.
 *
 * This script does not modify LUMA's rules,
 * dashboard, or email data.
 *
 * Prediction errors are reported rather than
 * causing the script to fail.
 */

import {
  emailHoldoutCases,
  type HoldoutGroup,
} from "../data/emailHoldoutCases";

import {
  evaluateEmail,
} from "../lib/emailIntelligence";

// Fixed time makes test results reproducible.
const now = new Date("2026-10-19T16:00:00Z");

const expectedGroupCounts: Record<HoldoutGroup, number> = {
  subtle_action: 10,
  routine_notification: 6,
  misleading_promotion: 6,
  potential_phishing: 6,
  mixed_context: 2,
};

// Validate dataset integrity.
if (emailHoldoutCases.length !== 30) {
  throw new Error("Expected exactly 30 holdout cases.");
}

const ids = emailHoldoutCases.map((test) => test.id);

if (new Set(ids).size !== ids.length) {
  throw new Error("Duplicate holdout email IDs found.");
}

for (const [group, expected] of Object.entries(
  expectedGroupCounts
)) {
  const actual = emailHoldoutCases.filter(
    (test) => test.group === group
  ).length;

  if (actual !== expected) {
    throw new Error(
      `${group}: expected ${expected} cases, found ${actual}`
    );
  }
}

if (
  emailHoldoutCases.some(
    (test) => test.email.requiresAction !== false
  )
) {
  throw new Error(
    "Ground-truth action labels must not be passed to the engine."
  );
}

// Run all emails through the existing engine.
const results = emailHoldoutCases.map((test) => {
  const decision = evaluateEmail(test.email, now);

  return {
    ...test,
    decision,

    typeCorrect:
      decision.type === test.expectedType,

    actionCorrect:
      decision.requiresAction === test.expectedAction,

    reviewCorrect:
      decision.needsReview === test.expectedNeedsReview,
  };
});

function percent(
  numerator: number,
  denominator: number
): string {
  if (denominator === 0) return "N/A";

  return `${(100 * numerator / denominator).toFixed(1)}%`;
}

const total = results.length;

const typeCorrect = results.filter(
  (r) => r.typeCorrect
).length;

const actionCorrect = results.filter(
  (r) => r.actionCorrect
).length;

const reviewCorrect = results.filter(
  (r) => r.reviewCorrect
).length;

// Action detection confusion matrix.
const tp = results.filter(
  (r) =>
    r.expectedAction &&
    r.decision.requiresAction
).length;

const fn = results.filter(
  (r) =>
    r.expectedAction &&
    !r.decision.requiresAction
).length;

const fp = results.filter(
  (r) =>
    !r.expectedAction &&
    r.decision.requiresAction
).length;

const tn = results.filter(
  (r) =>
    !r.expectedAction &&
    !r.decision.requiresAction
).length;

// Separate metrics for genuinely actionable
// emails and suspicious messages.
const subtle = results.filter(
  (r) => r.group === "subtle_action"
);

const phishing = results.filter(
  (r) => r.group === "potential_phishing"
);

const subtleDetected = subtle.filter(
  (r) => r.decision.requiresAction
).length;

const phishingFlagged = phishing.filter(
  (r) => r.decision.needsReview
).length;

const reviewFalsePositives = results.filter(
  (r) =>
    !r.expectedNeedsReview &&
    r.decision.needsReview
).length;

// Print the evaluation summary.
console.log("\n======================================");
console.log("   LUMA — UNSEEN EMAIL EVALUATION");
console.log("======================================");

console.log(`\nTotal emails: ${total}`);

console.table({
  "Email type accuracy": percent(typeCorrect, total),
  "Action detection accuracy": percent(actionCorrect, total),
  "Safety review accuracy": percent(reviewCorrect, total),
  "Action precision": percent(tp, tp + fp),
  "Action recall": percent(tp, tp + fn),
  "Subtle-action recall": percent(
    subtleDetected,
    subtle.length
  ),
  "Phishing-review recall": percent(
    phishingFlagged,
    phishing.length
  ),
});

console.log("\nACTION CONFUSION MATRIX");
console.table({
  "True positives": tp,
  "False negatives": fn,
  "False positives": fp,
  "True negatives": tn,
  "Safety-review false positives": reviewFalsePositives,
});

console.log("\nRESULTS BY GROUP");

console.table(
  Object.keys(expectedGroupCounts).map((group) => {
    const cases = results.filter(
      (r) => r.group === group
    );

    return {
      Group: group,
      Total: cases.length,
      "Type accuracy": percent(
        cases.filter((r) => r.typeCorrect).length,
        cases.length
      ),
      "Action accuracy": percent(
        cases.filter((r) => r.actionCorrect).length,
        cases.length
      ),
      "Review accuracy": percent(
        cases.filter((r) => r.reviewCorrect).length,
        cases.length
      ),
    };
  })
);

// Report every failed prediction.
const failures = results.filter(
  (r) =>
    !r.typeCorrect ||
    !r.actionCorrect ||
    !r.reviewCorrect
);

console.log(
  `\nEMAILS WITH ERRORS: ${failures.length}/${total}`
);

for (const result of failures) {
  console.log("\n--------------------------------------");
  console.log(`${result.id} | ${result.group}`);
  console.log(`Subject: ${result.email.subject}`);

  if (!result.typeCorrect) {
    console.log(
      `TYPE: Expected ${result.expectedType}, got ${result.decision.type}`
    );
  }

  if (!result.actionCorrect) {
    console.log(
      `ACTION: Expected ${result.expectedAction}, got ${result.decision.requiresAction}`
    );
  }

  if (!result.reviewCorrect) {
    console.log(
      `REVIEW: Expected ${result.expectedNeedsReview}, got ${result.decision.needsReview}`
    );
  }

  console.log(`Reason: ${result.decision.reason}`);
}

console.log("\n======================================");
console.log("HOLDOUT EVALUATION COMPLETE");
console.log("======================================");
console.log(
  "Record these results before modifying the engine."
);

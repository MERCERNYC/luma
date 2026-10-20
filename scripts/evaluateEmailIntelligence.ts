/**
 * LUMA — Email Intelligence Evaluation
 * ------------------------------------
 *
 * Purpose:
 * Run 50 fictional emails through LUMA's current
 * rules-based intelligence engine.
 *
 * Measures:
 * 1. Email type classification accuracy
 * 2. Action detection accuracy
 * 3. Action precision and recall
 * 4. Urgent-action recall
 * 5. Suspicious-email review detection
 * 6. Performance by test group
 *
 * This is an evaluation script, NOT a training script.
 *
 * We deliberately print failed cases so engineers
 * can understand where the algorithm needs improvement.
 *
 * IMPORTANT:
 * Incorrect predictions do not cause this script
 * to fail. We are measuring the current baseline.
 *
 * Invalid test data does cause the script to fail.
 */

import {
  emailTestCases,
  type EmailTestGroup,
} from "../data/emailTestCases";

import {
  evaluateEmail,
  prioritizeEmails,
} from "../lib/emailIntelligence";

// Use a fixed clock for reproducible evaluations.
// The date is only used for scoring and ranking.
const evaluationTime = new Date(
  "2026-10-19T16:00:00Z"
);

const expectedTotal = 50;

/**
 * Validate the evaluation dataset before testing.
 *
 * Unique IDs prevent results from being confused.
 * The manually supplied requiresAction field must
 * not reveal the expected action label.
 */
if (emailTestCases.length !== expectedTotal) {
  throw new Error(
    `Expected ${expectedTotal} cases, found ${emailTestCases.length}`
  );
}

const ids = emailTestCases.map((test) => test.id);

if (new Set(ids).size !== ids.length) {
  throw new Error("Duplicate test case IDs detected.");
}

if (
  emailTestCases.some(
    (test) => test.email.requiresAction !== false
  )
) {
  throw new Error(
    "All evaluation inputs must use requiresAction: false."
  );
}

/**
 * Evaluate every email.
 *
 * Ground-truth labels are compared with the
 * engine's predictions AFTER evaluation.
 *
 * Expected answers are never passed into
 * evaluateEmail().
 */
const results = emailTestCases.map((test) => {
  const prediction = evaluateEmail(
    test.email,
    evaluationTime
  );

  return {
    ...test,

    predictedType: prediction.type,
    predictedAction: prediction.requiresAction,
    predictedNeedsReview: prediction.needsReview,

    score: prediction.score,
    reason: prediction.reason,

    typeCorrect:
      prediction.type === test.expectedType,

    actionCorrect:
      prediction.requiresAction === test.expectedAction,

    reviewCorrect:
      prediction.needsReview ===
      test.expectedNeedsReview,
  };
});

/**
 * Helper: Convert a fraction to a percentage.
 *
 * N/A is used when the denominator is zero.
 */
function percentage(
  numerator: number,
  denominator: number
): string {
  if (denominator === 0) return "N/A";

  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function countWhere(
  predicate: (result: (typeof results)[number]) => boolean
): number {
  return results.filter(predicate).length;
}

// --------------------------------------------
// 1. OVERALL ACCURACY
// --------------------------------------------

const total = results.length;

const correctTypes = countWhere(
  (result) => result.typeCorrect
);

const correctActions = countWhere(
  (result) => result.actionCorrect
);

const correctReviews = countWhere(
  (result) => result.reviewCorrect
);

// --------------------------------------------
// 2. ACTION CONFUSION MATRIX
// --------------------------------------------

/**
 * True positive:
 * LUMA detected an action and one was required.
 *
 * False negative:
 * LUMA missed a real action.
 *
 * False positive:
 * LUMA requested action when none was required.
 *
 * True negative:
 * LUMA correctly identified no required action.
 */
const truePositives = countWhere(
  (r) => r.expectedAction && r.predictedAction
);

const falseNegatives = countWhere(
  (r) => r.expectedAction && !r.predictedAction
);

const falsePositives = countWhere(
  (r) => !r.expectedAction && r.predictedAction
);

const trueNegatives = countWhere(
  (r) => !r.expectedAction && !r.predictedAction
);

const actionPrecision = percentage(
  truePositives,
  truePositives + falsePositives
);

const actionRecall = percentage(
  truePositives,
  truePositives + falseNegatives
);

// --------------------------------------------
// 3. URGENT ACTION RECALL
// --------------------------------------------

/**
 * Measure the urgent_action group separately.
 *
 * Recall tells us how many real urgent requests
 * LUMA successfully detected.
 *
 * Our preliminary target is >= 95%.
 *
 * With only 15 urgent examples, meeting that
 * target requires detecting all 15.
 */
const urgentCases = results.filter(
  (r) => r.group === "urgent_action"
);

const detectedUrgent = urgentCases.filter(
  (r) => r.predictedAction
).length;

const urgentRecall = percentage(
  detectedUrgent,
  urgentCases.length
);

// --------------------------------------------
// 4. SPAM / SAFETY REVIEW
// --------------------------------------------

const spamCases = results.filter(
  (r) => r.expectedNeedsReview
);

const detectedSpam = spamCases.filter(
  (r) => r.predictedNeedsReview
).length;

const spamReviewRecall = percentage(
  detectedSpam,
  spamCases.length
);

const missedSpam = spamCases.filter(
  (r) => !r.predictedNeedsReview
);

// --------------------------------------------
// 5. PERFORMANCE BY GROUP
// --------------------------------------------

const groups: EmailTestGroup[] = [
  "urgent_action",
  "routine_notification",
  "promotion",
  "potential_spam",
  "tricky_case",
];

const groupSummary = groups.map((group) => {
  const cases = results.filter(
    (r) => r.group === group
  );

  return {
    Group: group,
    Total: cases.length,

    "Type accuracy": percentage(
      cases.filter((r) => r.typeCorrect).length,
      cases.length
    ),

    "Action accuracy": percentage(
      cases.filter((r) => r.actionCorrect).length,
      cases.length
    ),

    "Review accuracy": percentage(
      cases.filter((r) => r.reviewCorrect).length,
      cases.length
    ),
  };
});

// --------------------------------------------
// 6. PRINT RESULTS
// --------------------------------------------

console.log("\n==================================");
console.log("       LUMA EVALUATION REPORT");
console.log("==================================");

console.log(`\nTotal test emails: ${total}`);

console.log("\nOVERALL ACCURACY");
console.table({
  "Email type": percentage(correctTypes, total),
  "Action detection": percentage(correctActions, total),
  "Safety review": percentage(correctReviews, total),
});

console.log("\nACTION DETECTION");
console.table({
  "True positives": truePositives,
  "False negatives (missed actions)": falseNegatives,
  "False positives (unnecessary actions)": falsePositives,
  "True negatives": trueNegatives,
  "Action precision": actionPrecision,
  "Action recall": actionRecall,
});

console.log("\nKEY SAFETY AND URGENCY METRICS");
console.table({
  "Urgent actions detected": `${detectedUrgent}/${urgentCases.length}`,
  "Urgent-action recall": urgentRecall,
  "Suspicious emails flagged": `${detectedSpam}/${spamCases.length}`,
  "Spam-review recall": spamReviewRecall,
});

console.log("\nRESULTS BY GROUP");
console.table(groupSummary);

// --------------------------------------------
// 7. SHOW ALL FAILED PREDICTIONS
// --------------------------------------------

const failures = results.filter(
  (r) =>
    !r.typeCorrect ||
    !r.actionCorrect ||
    !r.reviewCorrect
);

console.log(
  `\nEMAILS WITH AT LEAST ONE ERROR: ${failures.length}`
);

for (const result of failures) {
  console.log("\n----------------------------------");
  console.log(
    `${result.id} | ${result.group}`
  );
  console.log(`Subject: ${result.email.subject}`);

  if (!result.typeCorrect) {
    console.log(
      `TYPE: Expected ${result.expectedType}, got ${result.predictedType}`
    );
  }

  if (!result.actionCorrect) {
    console.log(
      `ACTION: Expected ${result.expectedAction}, got ${result.predictedAction}`
    );
  }

  if (!result.reviewCorrect) {
    console.log(
      `REVIEW: Expected ${result.expectedNeedsReview}, got ${result.predictedNeedsReview}`
    );
  }

  console.log(`LUMA reason: ${result.reason}`);
}

// --------------------------------------------
// 8. CHECK THE TOP THREE RECOMMENDATIONS
// --------------------------------------------

/**
 * Run the full ranking pipeline.
 *
 * This helps us spot a different problem:
 * an email might be classified incorrectly
 * but still appear near the top of the inbox.
 */
const ranked = prioritizeEmails(
  emailTestCases.map((test) => test.email),
  evaluationTime
);

console.log("\nTOP THREE RANKED EMAILS");

for (const [index, decision] of ranked
  .filter(
    (decision) =>
      decision.requiresAction &&
      !decision.needsReview
  )
  .slice(0, 3)
  .entries()) {
  console.log(
    `${index + 1}. ${decision.email.subject} | Score: ${decision.score}`
  );
  console.log(`   Reason: ${decision.reason}`);
}

// --------------------------------------------
// 9. FINAL EVALUATION SUMMARY
// --------------------------------------------

console.log("\n==================================");
console.log("             SUMMARY");
console.log("==================================");

console.log(`Type accuracy: ${percentage(correctTypes, total)}`);
console.log(`Action accuracy: ${percentage(correctActions, total)}`);
console.log(`Action precision: ${actionPrecision}`);
console.log(`Action recall: ${actionRecall}`);
console.log(`Urgent-action recall: ${urgentRecall}`);
console.log(`Spam-review recall: ${spamReviewRecall}`);
console.log(`Emails with errors: ${failures.length}`);
console.log(`Missed suspicious emails: ${missedSpam.length}`);

console.log(
  "\nBaseline complete. Review the failures before changing the algorithm."
);

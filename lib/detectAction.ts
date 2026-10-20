
import type { LumaEmail } from "../types/email";

/**
 * LUMA — Automatic Email Action Detection
 * ---------------------------------------
 *
 * Purpose:
 * Identify whether an email contains a task
 * that requires the user's attention.
 *
 * Examples:
 * - Sign a school permission form
 * - Approve a proposal
 * - Confirm an appointment
 * - Update payment information
 * - Respond to a client
 *
 * This module uses rule-based text analysis.
 * It does not use a trained AI model.
 *
 * IMPORTANT:
 * This module detects requests, not whether
 * a request is trustworthy.
 *
 * Suspicious-message screening happens
 * separately in emailIntelligence.ts.
 */

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export type ActionResult = {
  requiresAction: boolean;

  actionType:
    | "reply"
    | "sign"
    | "confirm"
    | "review"
    | "submit"
    | "update"
    | "decide"
    | "authorize"
    | "none";

  reason: string;

  confidence: "high" | "medium" | "low";
};

// --------------------------------------------------
// ACTION DETECTION
// --------------------------------------------------

/**
 * Analyze an email and determine whether
 * it contains an explicit action request.
 *
 * IMPORTANT ENGINEERING DECISION:
 *
 * The subject and body are analyzed separately.
 *
 * Example:
 *
 * Subject: "Delivery update"
 * Body: "Your package is arriving tomorrow."
 *
 * Combining these fields into one string would
 * accidentally create "update your".
 *
 * That would incorrectly trigger our rule:
 * /\bupdate your\b/
 *
 * Separating the fields prevents this bug.
 */
export function detectAction(
  email: LumaEmail
): ActionResult {
  // STEP 1 — Normalize subject and body separately.
  const fields = [
    email.subject.toLowerCase(),
    email.body.toLowerCase(),
  ];

  /**
   * Check whether a pattern appears in either
   * the subject OR the body.
   *
   * Never match across the boundary between them.
   */
  const matches = (pattern: RegExp): boolean =>
    fields.some((field) => pattern.test(field));

  // --------------------------------------------------
  // STEP 2 — DETECT WHEN NO ACTION IS NEEDED
  // --------------------------------------------------

  /**
   * Explicit no-action statements take priority.
   *
   * These prevent false positives such as:
   *
   * "Your appointment is confirmed.
   *  No further action is needed."
   *
   * Limitation:
   * This checks the message as a whole.
   * A future AI agent should interpret individual
   * sentences and multiple requests separately.
   */
  const noActionPatterns: RegExp[] = [
    /\bno response is needed\b/,
    /\bno reply or further action is needed\b/,
    /\bno further (?:action|review) is required\b/,
    /\bno action (?:is )?needed\b/,
    /\bno further action\b/,
  ];

  if (noActionPatterns.some(matches)) {
    return {
      requiresAction: false,
      actionType: "none",
      reason: "The message indicates no action is needed.",
      confidence: "high",
    };
  }

  // --------------------------------------------------
  // STEP 3 — DETECT OPTIONAL REQUESTS
  // --------------------------------------------------

  /**
   * Optional requests should not automatically
   * appear in the user's Top 3 priorities.
   *
   * Example:
   *
   * "Please review your purchase if you wish."
   *
   * This is different from:
   *
   * "Please review and approve the contract."
   */
  const optionalPatterns: RegExp[] = [
    /\bif you wish\b/,
    /\bif you would like to receive\b/,
    /\bif you'd like to receive\b/,
  ];

  if (optionalPatterns.some(matches)) {
    return {
      requiresAction: false,
      actionType: "none",
      reason: "The request appears optional.",
      confidence: "medium",
    };
  }

  // --------------------------------------------------
  // STEP 4 — IDENTIFY ACTION TYPES
  // --------------------------------------------------

  /**
   * Each rule contains:
   *
   * type:
   * The kind of task requested.
   *
   * patterns:
   * Phrases that indicate this action.
   *
   * reason:
   * A short explanation shown to the user.
   *
   * More specific rules are evaluated before
   * general reply requests.
   */
  const actionRules: Array<{
    type: Exclude<ActionResult["actionType"], "none">;
    patterns: RegExp[];
    reason: string;
  }> = [
    // ----------------------------------------------
    // SIGN DOCUMENTS
    // ----------------------------------------------
    {
      type: "sign",
      patterns: [
        /\bplease sign\b/,
        /\bsign and return\b/,
        /\bpermission form\b/,
        /\bsignature required\b/,
        /\bsigned .*form has not been received\b/,
      ],
      reason: "A form or signature needs attention.",
    },

    // ----------------------------------------------
    // CONFIRM SOMETHING
    // ----------------------------------------------
    {
      type: "confirm",
      patterns: [
        /\bplease confirm\b/,
        /\bconfirmation required\b/,
        /\bcan you confirm\b/,
        /\bconfirm whether\b/,
        /\brsvp\b/,
      ],
      reason: "A confirmation is requested.",
    },

    // ----------------------------------------------
    // AUTHORIZE AN ACTION
    // ----------------------------------------------
    {
      type: "authorize",
      patterns: [
        /\bplease authorize\b/,
        /\bauthorize the\b/,
        /\bauthorization required\b/,
      ],
      reason: "Authorization is requested.",
    },

    // ----------------------------------------------
    // REVIEW OR APPROVE
    // ----------------------------------------------
    {
      type: "review",
      patterns: [
        /\bplease review\b/,
        /\bapproval needed\b/,
        /\bapprove the\b/,
        /\bawaiting your approval\b/,
      ],
      reason: "A review or approval is needed.",
    },

    // ----------------------------------------------
    // MAKE A DECISION
    // ----------------------------------------------
    {
      type: "decide",
      patterns: [
        /\bneed your decision\b/,
        /\bneed your choice\b/,
        /\byour decision on\b/,
      ],
      reason: "A decision is requested.",
    },

    // ----------------------------------------------
    // COMPLETE OR SUBMIT A TASK
    // ----------------------------------------------
    {
      type: "submit",
      patterns: [
        /\bplease complete\b/,
        /\bcomplete your\b/,
        /\bcomplete the\b/,
        /\bsubmit it\b/,
        /\bresubmit\b/,
      ],
      reason: "A form or task must be completed.",
    },

    // ----------------------------------------------
    // UPDATE INFORMATION
    // ----------------------------------------------
    {
      type: "update",
      patterns: [
        /\bmust be updated\b/,
        /\bupdate your\b/,
        /\bcorrect the missing\b/,
        /\badd the number\b/,
      ],
      reason: "Information needs to be updated.",
    },

    // ----------------------------------------------
    // REPLY OR RESPOND
    // ----------------------------------------------
    {
      type: "reply",
      patterns: [
        /\bplease reply\b/,
        /\bplease respond\b/,
        /\blet me know\b/,
        /\bresponse required\b/,
        /\bcould you send\b/,
        /\bplease send\b/,
        /\bare you available\b/,
      ],
      reason: "A response is requested.",
    },
  ];

  // --------------------------------------------------
  // STEP 5 — APPLY THE RULES
  // --------------------------------------------------

  /**
   * Evaluate each action type in order.
   *
   * The first matching rule determines the
   * primary action requested.
   *
   * Future versions can support emails that
   * contain multiple independent tasks.
   */
  for (const rule of actionRules) {
    if (rule.patterns.some(matches)) {
      return {
        requiresAction: true,
        actionType: rule.type,
        reason: rule.reason,
        confidence: "high",
      };
    }
  }

  // --------------------------------------------------
  // STEP 6 — NO ACTION DETECTED
  // --------------------------------------------------

  /**
   * If no pattern matches, return no action.
   *
   * Confidence is LOW because a keyword-based
   * system can miss requests expressed in
   * unfamiliar language.
   *
   * This result does not prove the email
   * requires no attention.
   */
  return {
    requiresAction: false,
    actionType: "none",
    reason: "No explicit action request detected.",
    confidence: "low",
  };
}

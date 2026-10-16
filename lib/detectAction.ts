import type { LumaEmail } from "../types/email";

export type ActionResult = {
  requiresAction: boolean;
  actionType: "reply" | "sign" | "confirm" | "review" | "none";
  reason: string;
  confidence: "high" | "medium" | "low";
};

export function detectAction(email: LumaEmail): ActionResult {
  const text = `${email.subject} ${email.body}`.toLowerCase();

  // Recognize clear requests for action.
  const actionRules = [
    {
      type: "sign" as const,
      patterns: [
        /\bplease sign\b/,
        /\bsign and return\b/,
        /\bpermission form\b/,
        /\bsignature required\b/,
      ],
      reason: "A form or signature is needed.",
    },
    {
      type: "confirm" as const,
      patterns: [
        /\bplease confirm\b/,
        /\bconfirmation required\b/,
        /\brsvp\b/,
      ],
      reason: "A confirmation is requested.",
    },
    {
      type: "review" as const,
      patterns: [
        /\bplease review\b/,
        /\bapproval needed\b/,
        /\bapprove the\b/,
      ],
      reason: "A review or approval is requested.",
    },
    {
      type: "reply" as const,
      patterns: [
        /\bplease reply\b/,
        /\bplease respond\b/,
        /\blet me know\b/,
        /\bresponse required\b/,
      ],
      reason: "A response is requested.",
    },
  ];

  for (const rule of actionRules) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return {
        requiresAction: true,
        actionType: rule.type,
        reason: rule.reason,
        confidence: "high",
      };
    }
  }

  return {
    requiresAction: false,
    actionType: "none",
    reason: "No explicit action request detected.",
    confidence: "low",
  };
}
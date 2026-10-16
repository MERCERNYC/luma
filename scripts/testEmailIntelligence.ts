import { trainingCases } from "../data/emailTrainingCases";
import { evaluateEmail, prioritizeEmails } from "../lib/emailIntelligence";
import { detectAction } from "../lib/detectAction";

const now = new Date("2026-10-16T12:00:00-04:00");

let passed = 0;

for (const test of trainingCases) {
  const result = evaluateEmail(test.email, now);

  const correct =
    result.type === test.expectedType &&
    result.requiresAction === test.expectedAction;

  console.log(
    `${correct ? "PASS" : "FAIL"} | ${test.email.subject}` +
    ` | Type: ${result.type}` +
    ` | Action: ${result.requiresAction}` +
    ` | Score: ${result.score}`
  );

  if (correct) passed++;
}

const ranked = prioritizeEmails(
  trainingCases.map((test) => test.email),
  now
);

console.log("\nPriority order:");
ranked.forEach((result, index) => {
  console.log(
    `${index + 1}. ${result.email.subject} (${result.score})`
  );
});

console.log(
  `\n${passed}/${trainingCases.length} classification tests passed`
);

if (passed !== trainingCases.length) {
  process.exitCode = 1;
}

console.log("\nAutomatic action detection:");

const examples = [
  {
    subject: "School permission form",
    body: "Please sign and return the form by Friday.",
    expected: true,
  },
  {
    subject: "Your order has shipped",
    body: "Your package is on its way.",
    expected: false,
  },
  {
    subject: "Appointment reminder",
    body: "Please confirm your appointment by 4 PM.",
    expected: true,
  },
  {
    subject: "Weekend sale",
    body: "Enjoy 20% off your next purchase.",
    expected: false,
  },
];

for (const example of examples) {
  const email = {
    id: example.subject,
    sender: "Test Sender",
    subject: example.subject,
    body: example.body,
    receivedAt: new Date().toISOString(),
    requiresAction: false,
    importantSender: false,
    isNewsletter: false,
  };

  const result = detectAction(email);
  const passed = result.requiresAction === example.expected;

  console.log(
    `${passed ? "PASS" : "FAIL"} | ${example.subject} | Action: ${result.requiresAction}`
  );

  if (!passed) process.exitCode = 1;
}
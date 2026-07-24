import test from "node:test";
import assert from "node:assert/strict";

import {
  analyzeMessage,
  analyzerLimits,
  buildTriageReport,
} from "./analyzeMessage.mjs";

test("returns a calibrated empty result", () => {
  const result = analyzeMessage("");

  assert.equal(result.score, 0);
  assert.equal(result.findings.length, 0);
  assert.match(result.assessment.summary, /does not confirm/i);
  assert.match(result.disclaimer, /cannot confirm/i);
});

test("groups multiple observable warning patterns without declaring a verdict", () => {
  const result = analyzeMessage(
    "URGENT: Your bank account will be blocked. Share your OTP immediately at http://198.51.100.5/login and approve the UPI collect request.",
    { channel: "whatsapp" },
  );
  const categories = new Set(result.categories.map((category) => category.id));

  assert.ok(categories.has("urgency"));
  assert.ok(categories.has("credentials"));
  assert.ok(categories.has("payment"));
  assert.ok(categories.has("links"));
  assert.ok(result.score >= 55);
  assert.doesNotMatch(result.assessment.label, /\b(?:is|definitely)\s+(?:a\s+)?scam\b/i);
  assert.match(result.disclaimer, /cannot confirm/i);
});

test("finds hidden controls and mixed-alphabet look-alikes", () => {
  const result = analyzeMessage("Review https://раypal.com\u202E now");
  const findingIds = result.findings.map((finding) => finding.id);

  assert.ok(findingIds.includes("unicode-controls"));
  assert.ok(findingIds.includes("unicode-mixed-alphabet"));
  assert.ok(result.findings.some((finding) => finding.category === "links"));
});

test("does not treat common safety advice as a credential request", () => {
  const result = analyzeMessage("Security reminder: never share your OTP or PIN with anyone.");

  assert.equal(
    result.findings.some((finding) => finding.category === "credentials"),
    false,
  );
});

test("flags shortened URLs and produces an actionable report", () => {
  const result = analyzeMessage("See the update at https://bit.ly/example");
  const report = buildTriageReport(result);

  assert.ok(result.findings.some((finding) => finding.category === "links"));
  assert.match(report, /not a probability/i);
  assert.match(report, /verify/i);
});

test("limits unusually large inputs before analysis", () => {
  const result = analyzeMessage("a".repeat(analyzerLimits.maxMessageLength + 500));

  assert.equal(result.messageLength, analyzerLimits.maxMessageLength);
});

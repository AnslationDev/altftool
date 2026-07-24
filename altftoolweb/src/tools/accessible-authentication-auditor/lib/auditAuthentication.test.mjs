import assert from "node:assert/strict";
import test from "node:test";

import {
  auditAuthenticationExperience,
  authenticationAuditLimits,
  buildAuthenticationAuditReport,
  defaultAuthenticationChecklist,
} from "./auditAuthentication.mjs";

function findingIds(result) {
  return result.findings.map((item) => item.id);
}

test("requires source or at least one observed behavior", () => {
  const result = auditAuthenticationExperience();
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /Paste authentication HTML/iu);
});

test("detects inline paste blocking without executing source", () => {
  const result = auditAuthenticationExperience({
    source:
      '<input type="password" autocomplete="current-password" onpaste="return false">',
  });
  assert.equal(result.ok, true);
  assert.equal(findingIds(result).includes("paste-blocked"), true);
  assert.equal(result.scope.sourceExecuted, false);
  assert.equal(result.scope.remoteFetched, false);
});

test("detects script-based paste prevention but ignores fake inputs inside scripts", () => {
  const result = auditAuthenticationExperience({
    source: `
      <script>
        window.secret = "<input type='password'>";
        field.addEventListener("paste", (event) => event.preventDefault());
      </script>
      <input name="username" autocomplete="username">
    `,
  });
  assert.equal(findingIds(result).includes("paste-blocked"), true);
  assert.equal(result.stats.inputs, 1);
  assert.equal(result.stats.passwordInputs, 0);
});

test("does not parse fake elements inside an unterminated active-content block", () => {
  const result = auditAuthenticationExperience({
    source: "<script>const template = '<input type=\"password\">';",
  });
  assert.equal(result.stats.inputs, 0);
  assert.equal(result.stats.passwordInputs, 0);
});

test("reports autocomplete off and missing credential-purpose tokens", () => {
  const result = auditAuthenticationExperience({
    source: `
      <input name="username" autocomplete="off">
      <input type="password">
    `,
  });
  assert.equal(
    findingIds(result).includes("credential-assistance-blocked"),
    true,
  );
  assert.equal(findingIds(result).includes("credential-purpose-unclear"), true);
});

test("accepts explicit username and current-password purpose cues", () => {
  const result = auditAuthenticationExperience({
    source: `
      <input name="account" autocomplete="username">
      <input type="password" autocomplete="current-password">
    `,
  });
  assert.equal(
    findingIds(result).includes("credential-purpose-unclear"),
    false,
  );
  assert.equal(
    findingIds(result).includes("credential-assistance-blocked"),
    false,
  );
});

test("reports form-level autocomplete off when credentials are present", () => {
  const result = auditAuthenticationExperience({
    source: `
      <form autocomplete="off">
        <input autocomplete="username">
        <input type="password" autocomplete="current-password">
      </form>
    `,
  });
  assert.equal(
    findingIds(result).includes("credential-assistance-blocked"),
    true,
  );
});

test("flags segmented verification-code inputs without full-code assistance", () => {
  const source = Array.from(
    { length: 6 },
    (_, index) =>
      `<input name="otp-${index}" inputmode="numeric" maxlength="1">`,
  ).join("");
  const result = auditAuthenticationExperience({ source });
  assert.equal(
    findingIds(result).includes("verification-code-transcription"),
    true,
  );
  assert.equal(result.stats.codeInputs, 6);
});

test("treats challenge keywords as a review cue rather than a conformance verdict", () => {
  const result = auditAuthenticationExperience({
    source: "<p>Solve this CAPTCHA to continue.</p>",
  });
  assert.equal(findingIds(result).includes("cognitive-challenge-review"), true);
  assert.equal(
    result.findings.find((item) => item.id === "cognitive-challenge-review")
      .severity,
    "review",
  );
});

test("records a forced cognitive test and missing alternative as high priority", () => {
  const result = auditAuthenticationExperience({
    checklist: {
      ...defaultAuthenticationChecklist,
      cognitiveRequirement: "forced-recall-or-transcription",
      alternativeMethod: "unavailable",
    },
  });
  assert.equal(findingIds(result).includes("forced-cognitive-test"), true);
  assert.equal(
    findingIds(result).includes("alternative-path-not-evident"),
    true,
  );
  assert.equal(result.counts.high, 2);
});

test("does not treat an assisting mechanism as a cognitive test", () => {
  const result = auditAuthenticationExperience({
    checklist: {
      ...defaultAuthenticationChecklist,
      cognitiveRequirement: "assisted-or-alternative",
      alternativeMethod: "unavailable",
    },
  });
  assert.equal(findingIds(result).includes("forced-cognitive-test"), false);
  assert.equal(
    findingIds(result).includes("alternative-path-not-evident"),
    false,
  );
  assert.equal(result.counts.high, 0);
});

test("distinguishes minimum-level object recognition exceptions from enhanced guidance", () => {
  const result = auditAuthenticationExperience({
    checklist: {
      cognitiveRequirement: "object-recognition-only",
      alternativeMethod: "available",
    },
  });
  const item = result.findings.find(
    (candidate) => candidate.id === "minimum-exception-enhanced-barrier",
  );
  assert.equal(item.severity, "review");
  assert.match(item.reason, /not exceptions in SC 3\.3\.9/iu);
});

test("reports unsupported and claimed-exception time limits differently", () => {
  const unsupported = auditAuthenticationExperience({
    checklist: { timeoutSupport: "unsupported", timeoutSeconds: "30" },
  });
  const exception = auditAuthenticationExperience({
    checklist: {
      timeoutSupport: "essential-exception",
      timeoutSeconds: "30",
    },
  });
  assert.equal(
    unsupported.findings.find((item) => item.id === "time-limit-not-adjustable")
      .severity,
    "high",
  );
  assert.equal(
    exception.findings.find((item) => item.id === "time-limit-exception-review")
      .severity,
    "review",
  );
});

test("reports unclear manual recovery and unassociated error-looking markup", () => {
  const result = auditAuthenticationExperience({
    source: '<p class="login-error">Try again</p>',
    checklist: { errorRecovery: "generic-or-unclear" },
  });
  assert.equal(findingIds(result).includes("error-recovery-unclear"), true);
  assert.equal(
    findingIds(result).includes("static-error-association-review"),
    true,
  );
});

test("bounds source and element processing", () => {
  const oversizedSource =
    "<input>".repeat(authenticationAuditLimits.maxElements + 100) +
    "x".repeat(authenticationAuditLimits.maxSourceLength);
  const result = auditAuthenticationExperience({ source: oversizedSource });
  assert.equal(result.scope.sourceTruncated, true);
  assert.ok(
    result.stats.elementsInspected <= authenticationAuditLimits.maxElements,
  );
});

test("handles malformed and unknown manual values deterministically", () => {
  const first = auditAuthenticationExperience({
    source: '<input type="password"',
    checklist: {
      pasteSupport: "unexpected",
      timeoutSeconds: "not-a-number",
    },
  });
  const second = auditAuthenticationExperience({
    source: '<input type="password"',
    checklist: {
      pasteSupport: "unexpected",
      timeoutSeconds: "not-a-number",
    },
  });
  assert.deepEqual(first, second);
});

test("counts-only report excludes source and checklist values", () => {
  const secret = "PRIVATE-ACCOUNT-SECRET";
  const result = auditAuthenticationExperience({
    source: `<input value="${secret}" type="password" autocomplete="off">`,
    checklist: {
      passwordManagerSupport: "blocked",
      errorRecovery: "generic-or-unclear",
    },
  });
  const report = buildAuthenticationAuditReport(result);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes(secret), false);
  assert.equal(serialized.includes("generic-or-unclear"), false);
  assert.equal(report.scope.rawSourceIncluded, false);
  assert.equal(report.scope.checklistAnswersIncluded, false);
  assert.equal(report.scope.conformanceEstablished, false);
  assert.equal(report.scope.legalCertification, false);
});

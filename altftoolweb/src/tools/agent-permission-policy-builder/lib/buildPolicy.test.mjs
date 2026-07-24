import assert from "node:assert/strict";
import test from "node:test";

import { parsePolicy } from "../../tool-call-argument-policy-linter/lib/policyLinter.mjs";
import {
  buildPermissionPolicy,
  buildPolicySummaryReport,
  parseDomainRules,
  parseList,
  parseNumericLimits,
  serializePermissionPolicy,
} from "./buildPolicy.mjs";

test("parses and deduplicates line or comma separated lists", () => {
  assert.deepEqual(parseList("read.*\nwrite.file, READ.*"), ["read.*", "write.file"]);
});

test("accepts exact and wildcard hostnames but rejects URLs and paths", () => {
  const result = parseDomainRules("example.com\n*.trusted.example\nhttps://bad.example/x");
  assert.deepEqual(result.accepted, ["example.com", "*.trusted.example"]);
  assert.deepEqual(result.invalid, ["https://bad.example/x"]);
});

test("parses non-negative numeric limits with actionable errors", () => {
  const result = parseNumericLimits("amount = 5000\nretries: 3\ninvalid");
  assert.deepEqual(result.limits, { amount: 5000, retries: 3 });
  assert.equal(result.errors.length, 1);
});

test("builds a policy compatible with the argument policy linter", () => {
  const result = buildPermissionPolicy({
    allowedTools: "read.*\nsend.email",
    deniedTools: "delete.*",
    allowedPathPrefixes: "/workspace/project",
    allowedDomains: "api.example.com\n*.trusted.example",
    allowedRecipients: "ops@example.com\n@company.example",
    numericLimits: "amount=2500\nretries=3",
    requiredConfirmationTools: "send.*",
    acceptedConfirmationFlags: "confirmed\napproved",
  });
  assert.equal(result.ok, true);
  const parsed = parsePolicy(serializePermissionPolicy(result));
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.policy.numericLimits, { amount: 2500, retries: 3 });
});

test("reports deny precedence and relative path limitations", () => {
  const result = buildPermissionPolicy({
    allowedTools: "send.email",
    deniedTools: "send.email",
    allowedPathPrefixes: "exports",
  });
  assert.equal(result.ok, true);
  assert.equal(result.warnings.length, 2);
});

test("requires a confirmation flag for confirmation-protected tools", () => {
  const result = buildPermissionPolicy({
    requiredConfirmationTools: "send.*",
  });
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /confirmation flag/i);
});

test("counts-only summary excludes policy values", () => {
  const secret = "private-person@example.com";
  const result = buildPermissionPolicy({ allowedRecipients: secret });
  const report = buildPolicySummaryReport(result);
  assert.equal(JSON.stringify(report).includes(secret), false);
  assert.equal(report.ruleCounts.recipientRules, 1);
});

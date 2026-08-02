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
  const result = parseList("read.*\nwrite.file, READ.*");
  assert.deepEqual(result.items, ["read.*", "write.file"]);
  assert.deepEqual(result.warnings, []);
});

test("warns instead of silently dropping entries past the 200-item limit", () => {
  const entries = Array.from({ length: 250 }, (_, i) => `delete.tool${i}`);
  const result = parseList(entries.join("\n"), "Denied tool patterns");
  assert.equal(result.items.length, 200);
  assert.equal(result.items.at(-1), "delete.tool199");
  assert.equal(result.items.includes("delete.tool249"), false);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /Denied tool patterns.*50 entries.*dropped/);
});

test("warns instead of silently truncating entries past 500 characters", () => {
  const longEntry = "a".repeat(525);
  const result = parseList(longEntry, "Allowed tool patterns");
  assert.equal(result.items[0].length, 500);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /Allowed tool patterns.*1 entry.*truncated/);
});

test("accepts exact and wildcard hostnames but rejects URLs and paths", () => {
  const result = parseDomainRules("example.com\n*.trusted.example\nhttps://bad.example/x");
  assert.deepEqual(result.accepted, ["example.com", "*.trusted.example"]);
  assert.deepEqual(result.invalid, ["https://bad.example/x"]);
});

test("rejects hostnames with empty labels or misplaced hyphens", () => {
  const result = parseDomainRules("example..com\n-example.com\nexample-.com\nexample.com");
  assert.deepEqual(result.accepted, ["example.com"]);
  assert.deepEqual(result.invalid, ["example..com", "-example.com", "example-.com"]);
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

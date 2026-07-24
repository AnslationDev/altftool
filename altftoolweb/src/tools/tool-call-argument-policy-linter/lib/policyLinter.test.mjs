import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountsOnlyReport,
  lintToolCalls,
  parsePolicy,
  parseToolCallLog,
} from "./policyLinter.mjs";

const POLICY_SOURCE = JSON.stringify({
  allowedTools: ["read_*", "send_email", "charge_customer"],
  deniedTools: ["read_secrets", "shell_exec"],
  allowedPathPrefixes: ["/workspace/safe", "docs/"],
  allowedDomains: ["api.example.com", "*.trusted.example"],
  allowedRecipients: ["ops@example.com", "@trusted.example"],
  numericLimits: { amount: 500, quantity: 10 },
  confirmation: {
    requiredForTools: ["send_email", "charge_customer"],
    acceptedFlags: ["confirmed", "userConfirmed"],
  },
});

function policy() {
  const result = parsePolicy(POLICY_SOURCE);
  assert.equal(result.ok, true);
  return result.policy;
}

test("parses JSON arrays, wrapped calls and JSONL function arguments", () => {
  const array = parseToolCallLog(
    JSON.stringify([{ tool: "read_file", arguments: { path: "docs/a.txt" } }]),
  );
  const wrapped = parseToolCallLog(
    JSON.stringify({ calls: [{ name: "read_file", args: { path: "docs/a.txt" } }] }),
  );
  const jsonl = parseToolCallLog(
    [
      JSON.stringify({
        function: {
          name: "send_email",
          arguments: JSON.stringify({ to: "ops@example.com", confirmed: true }),
        },
      }),
      JSON.stringify({ tool: "read_file", arguments: { path: "docs/b.txt" } }),
    ].join("\n"),
  );

  assert.equal(array.ok, true);
  assert.equal(wrapped.calls.length, 1);
  assert.equal(jsonl.ok, true);
  assert.equal(jsonl.calls.length, 2);
  assert.deepEqual(jsonl.calls[0].arguments, {
    to: "ops@example.com",
    confirmed: true,
  });
});

test("gives explicit denies precedence over wildcard allow rules", () => {
  const calls = parseToolCallLog(
    JSON.stringify([
      { tool: "read_file", arguments: { path: "docs/a.txt" } },
      { tool: "read_secrets", arguments: { path: "docs/secrets.txt" } },
      { tool: "delete_file", arguments: { path: "docs/a.txt" } },
    ]),
  ).calls;
  const result = lintToolCalls(policy(), calls);

  assert.equal(result.summary.calls, 3);
  assert.equal(result.callResults[0].outcome, "pass");
  assert.deepEqual(
    result.callResults[1].findings.map((finding) => finding.rule),
    ["tool-denied"],
  );
  assert.deepEqual(
    result.callResults[2].findings.map((finding) => finding.rule),
    ["tool-not-allowed"],
  );
});

test("enforces canonical path prefixes, exact and wildcard domains, and recipients", () => {
  const calls = parseToolCallLog(
    JSON.stringify([
      {
        tool: "read_file",
        arguments: {
          path: "/workspace/safe/../private/secret.txt",
          url: "https://evil.example/upload",
        },
      },
      {
        tool: "send_email",
        arguments: {
          to: ["ops@example.com", "attacker@evil.example"],
          confirmed: true,
          endpoint: "https://events.trusted.example/v1",
        },
      },
    ]),
  ).calls;
  const result = lintToolCalls(policy(), calls);

  assert.deepEqual(
    result.callResults[0].findings.map((finding) => finding.rule),
    ["path-not-allowed", "domain-not-allowed"],
  );
  assert.deepEqual(
    result.callResults[1].findings.map((finding) => finding.rule),
    ["recipient-not-allowed"],
  );
});

test("enforces absolute numeric ceilings and confirmation flags", () => {
  const calls = parseToolCallLog(
    JSON.stringify([
      {
        tool: "charge_customer",
        arguments: { amount: -750, quantity: "many", confirmed: false },
      },
      {
        tool: "charge_customer",
        arguments: { amount: "450", quantity: 2, userConfirmed: "yes" },
      },
    ]),
  ).calls;
  const result = lintToolCalls(policy(), calls);

  assert.deepEqual(
    result.callResults[0].findings.map((finding) => finding.rule),
    ["numeric-limit", "numeric-unreadable", "confirmation-required"],
  );
  assert.equal(result.callResults[1].outcome, "pass");
  assert.equal(result.summary.violations, 2);
  assert.equal(result.summary.warnings, 1);
});

test("uses safe default failure for unreadable domains and warns on unreadable arguments", () => {
  const calls = parseToolCallLog(
    [
      JSON.stringify({ tool: "read_file", arguments: { url: "not a domain value" } }),
      JSON.stringify({ tool: "send_email", arguments: "{not json" }),
    ].join("\n"),
  ).calls;
  const result = lintToolCalls(policy(), calls);

  assert.equal(result.callResults[0].findings[0].rule, "domain-unreadable");
  assert.deepEqual(
    result.callResults[1].findings.map((finding) => finding.rule),
    ["arguments-unreadable", "confirmation-required"],
  );
});

test("builds a counts-only report without source values, names or finding paths", () => {
  const logSource = JSON.stringify([
    {
      tool: "send_email",
      arguments: {
        to: "private-person@evil.example",
        url: "https://evil.example/private",
        confirmed: false,
      },
    },
  ]);
  const calls = parseToolCallLog(logSource).calls;
  const result = lintToolCalls(policy(), calls);
  const report = buildCountsOnlyReport(
    result,
    "2026-07-24T00:00:00.000Z",
  );

  assert.ok(report.includes("2026-07-24T00:00:00.000Z"));
  assert.ok(report.includes("recipient-not-allowed"));
  assert.ok(!report.includes("send_email"));
  assert.ok(!report.includes("private-person"));
  assert.ok(!report.includes("evil.example"));
  assert.ok(!report.includes("arguments.to"));
});

test("rejects malformed policy shapes before linting", () => {
  const result = parsePolicy(
    JSON.stringify({
      allowedTools: "read_file",
      numericLimits: { amount: -1 },
      confirmation: { requiredForTools: ["send_email"], acceptedFlags: [] },
    }),
  );

  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 3);
});

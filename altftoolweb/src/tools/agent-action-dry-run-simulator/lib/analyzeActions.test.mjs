import test from "node:test";
import assert from "node:assert/strict";

import {
  analyzeActions,
  buildDryRunReport,
  parseActionCalls,
} from "./analyzeActions.mjs";

test("parses a single call and common nested function arguments", () => {
  const single = parseActionCalls('{"tool":"read_file","arguments":{"path":"README.md"}}');
  assert.equal(single.ok, true);
  assert.equal(single.value.length, 1);
  assert.equal(single.value[0].name, "read_file");

  const nested = parseActionCalls(
    JSON.stringify({
      tool_calls: [
        {
          function: {
            name: "send_email",
            arguments: JSON.stringify({ to: "owner@example.com", body: "Ready" }),
          },
        },
      ],
    }),
  );
  assert.equal(nested.ok, true);
  assert.deepEqual(nested.value[0].arguments, {
    to: "owner@example.com",
    body: "Ready",
  });
});

test("flags deletion, its target, reversibility, and missing safeguards", () => {
  const parsed = parseActionCalls(
    JSON.stringify({
      name: "delete_file",
      arguments: { path: "reports/final.csv" },
    }),
  );
  const [action] = analyzeActions(parsed.value).actions;

  assert.equal(action.effects.deletion, true);
  assert.equal(action.effects.write, false);
  assert.equal(action.targets[0].value, "reports/final.csv");
  assert.equal(action.reversibility.level, "likely-irreversible");
  assert.ok(action.safeguards.missing.some(({ id }) => id === "confirmation"));
  assert.ok(action.safeguards.missing.some(({ id }) => id === "recovery"));
  assert.ok(["high", "critical"].includes(action.risk.level));
});

test("flags messages and money movements as external, without inferring money from amount alone", () => {
  const parsed = parseActionCalls(
    JSON.stringify([
      {
        name: "send_email",
        arguments: { to: "team@example.com", subject: "Launch", body: "Go" },
      },
      {
        name: "transfer_funds",
        arguments: { recipient: "vendor-42", amount: 500, currency: "USD" },
      },
      {
        name: "calculate_total",
        arguments: { amount: 500, taxRate: 0.18 },
      },
    ]),
  );
  const result = analyzeActions(parsed.value);

  assert.equal(result.actions[0].effects.message, true);
  assert.equal(result.actions[0].effects.external, true);
  assert.equal(result.actions[1].effects.money, true);
  assert.equal(result.actions[1].effects.external, true);
  assert.equal(result.actions[1].risk.level, "critical");
  assert.equal(result.actions[2].effects.money, false);
});

test("detects safeguards without treating false flags as present", () => {
  const parsed = parseActionCalls(
    JSON.stringify([
      {
        name: "update_file",
        arguments: {
          path: "config.json",
          content: "{}",
          confirmed: true,
          dryRun: true,
          backup: "config.json.bak",
          allowedPaths: ["config.json"],
        },
      },
      {
        name: "delete_file",
        arguments: { path: "old.txt", confirmed: false, dryRun: false, backup: false },
      },
    ]),
  );
  const result = analyzeActions(parsed.value);
  const protectedWrite = result.actions[0];
  const unprotectedDelete = result.actions[1];

  assert.deepEqual(
    protectedWrite.safeguards.present.map(({ id }) => id).sort(),
    ["confirmation", "preview", "recovery", "scope"],
  );
  assert.equal(protectedWrite.reversibility.level, "potentially-reversible");
  assert.equal(unprotectedDelete.safeguards.present.length, 0);
});

test("keeps read-only calls low signal with no mutation safeguard prompts", () => {
  const parsed = parseActionCalls(
    JSON.stringify({ name: "search_documents", arguments: { query: "release notes" } }),
  );
  const [action] = analyzeActions(parsed.value).actions;

  assert.equal(action.effects.read, true);
  assert.equal(action.risk.level, "low");
  assert.equal(action.safeguards.missing.length, 0);
  assert.equal(action.reversibility.level, "not-applicable");
});

test("report states the non-execution guarantee and limitations", () => {
  const parsed = parseActionCalls(
    JSON.stringify({ name: "run_command", arguments: { command: "npm test" } }),
  );
  const report = buildDryRunReport(analyzeActions(parsed.value));

  assert.match(report, /no tool call was connected, sent, saved, or executed/i);
  assert.match(report, /deterministic pattern matching/i);
  assert.match(report, /low score does not prove safety/i);
});

test("returns clear errors for invalid roots and primitive call entries", () => {
  assert.equal(parseActionCalls('"hello"').ok, false);
  assert.match(parseActionCalls("[{} , 42]").error, /Tool call 2/);
});

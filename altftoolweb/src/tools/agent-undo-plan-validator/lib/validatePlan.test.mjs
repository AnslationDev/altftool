import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzePlan,
  buildValidationReport,
  parsePlan,
} from "./validatePlan.mjs";

test("requires at least one readable action", () => {
  assert.equal(parsePlan("").ok, false);
  assert.match(parsePlan("   ").error, /at least one/i);
});

test("parses line-based plans and recognizes read-only work", () => {
  const result = analyzePlan(
    "1. Inspect the release configuration\n2. Dry-run the migration and compare its output",
  );

  assert.equal(result.ok, true);
  assert.equal(result.format, "lines");
  assert.equal(result.actions.length, 2);
  assert.equal(result.counts.reversible, 2);
  assert.equal(result.overallRisk, "low");
});

test("classifies destructive work without recovery safeguards as irreversible", () => {
  const result = analyzePlan("Delete the production database and remove its backups");
  const action = result.actions[0];

  assert.equal(action.classification, "irreversible");
  assert.equal(action.risk, "high");
  assert.ok(action.sideEffects.includes("Destructive change"));
  assert.deepEqual(
    action.missingSafeguards.map((item) => item.key).sort(),
    ["backup", "confirmation", "checkpoint", "rollback"].sort(),
  );
  assert.equal(result.counts.destructive, 1);
});

test("uses detailed plan-wide safeguards without claiming guaranteed reversibility", () => {
  const result = analyzePlan(
    JSON.stringify({
      safeguards: {
        backup: "Create snapshot named pre-migration in the recovery bucket before changes.",
        checkpoint: "Create Git tag named pre-migration before deployment.",
        confirmation: "Get approval from the database owner before deletion.",
        rollback: "Restore from snapshot pre-migration using the recovery console.",
      },
      actions: [
        {
          name: "Delete obsolete customer rows",
          description: "Remove records selected in the approved cleanup list.",
        },
      ],
    }),
  );

  assert.equal(result.format, "json");
  assert.equal(result.actions[0].classification, "recoverable");
  assert.equal(result.actions[0].missingSafeguards.length, 0);
  assert.match(result.actions[0].reason, /may still be incomplete|may still.*fail/i);
});

test("keeps external communication irreversible even when rollback is mentioned", () => {
  const result = analyzePlan(
    "Get approval from the release owner before launch.\nSend the announcement email to all customers.\nRollback by restoring version 2.",
  );
  const sendAction = result.actions.find((action) => /send/i.test(action.title));

  assert.equal(sendAction.classification, "irreversible");
  assert.ok(sendAction.sideEffects.includes("External side effect"));
  assert.match(sendAction.reason, /cannot retract every consequence/i);
});

test("report contains evidence, safeguards, limits, and non-execution statement", () => {
  const result = analyzePlan('[{"action":"Deploy release to production"}]');
  const report = buildValidationReport(result);

  assert.match(report, /Plan safeguards/);
  assert.match(report, /Evidence:/);
  assert.match(report, /Limits/);
  assert.match(report, /No action was executed/);
});

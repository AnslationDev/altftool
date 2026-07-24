import test from "node:test";
import assert from "node:assert/strict";

import {
  ACCOUNT_GROUPS,
  ALL_ACTIONS,
  buildCountsOnlyReport,
  buildRecoveryPlan,
  countsOnlyFilename,
  createActionState,
  createSelectionState,
  EVIDENCE_TYPES,
  getRecoverySummary,
  hasRecoverySelections,
  OBSERVED_SYMPTOMS,
  OFFICIAL_SOURCES,
} from "./recoveryPack.mjs";

test("keeps the recovery domains in the intended operational order", () => {
  const symptoms = createSelectionState(OBSERVED_SYMPTOMS);
  const accounts = createSelectionState(ACCOUNT_GROUPS);
  const actions = createActionState();
  const plan = buildRecoveryPlan(symptoms, accounts, actions);

  assert.deepEqual(
    plan.map((domain) => domain.id),
    ["carrier", "bank-payment", "email", "accounts-sessions", "evidence"],
  );
});

test("prioritises affected domains without producing a risk or recovery score", () => {
  const symptoms = createSelectionState(OBSERVED_SYMPTOMS);
  const accounts = createSelectionState(ACCOUNT_GROUPS);
  const actions = createActionState();

  symptoms["network-loss"] = true;
  symptoms["financial-activity"] = true;
  accounts.email = true;

  const plan = buildRecoveryPlan(symptoms, accounts, actions);
  assert.equal(plan.find((domain) => domain.id === "carrier").prioritised, true);
  assert.equal(
    plan.find((domain) => domain.id === "bank-payment").prioritised,
    true,
  );
  assert.equal(plan.find((domain) => domain.id === "email").prioritised, true);
  assert.equal("score" in plan[0], false);
});

test("summarises only selection and completion counts", () => {
  const symptoms = createSelectionState(OBSERVED_SYMPTOMS);
  const accounts = createSelectionState(ACCOUNT_GROUPS);
  const actions = createActionState();
  const evidence = createSelectionState(EVIDENCE_TYPES);

  symptoms["sim-change-notice"] = true;
  accounts.bank = true;
  actions["carrier-official-channel"] = true;
  evidence["carrier-notice"] = true;

  const summary = getRecoverySummary({
    symptoms,
    accounts,
    actions,
    evidence,
  });

  assert.equal(summary.selectedSymptoms, 1);
  assert.equal(summary.selectedAccounts, 1);
  assert.equal(summary.completedActions, 1);
  assert.equal(summary.preservedEvidence, 1);
  assert.equal(summary.totalActions, ALL_ACTIONS.length);
});

test("counts-only export omits selected labels and makes no recovery guarantee", () => {
  const symptoms = createSelectionState(OBSERVED_SYMPTOMS);
  const accounts = createSelectionState(ACCOUNT_GROUPS);
  const actions = createActionState();
  const evidence = createSelectionState(EVIDENCE_TYPES);

  symptoms["network-loss"] = true;
  accounts.bank = true;
  evidence["financial-record"] = true;

  const report = buildCountsOnlyReport({
    symptoms,
    accounts,
    actions,
    evidence,
    createdAt: new Date("2026-07-24T10:15:00.000Z"),
  });

  assert.match(report, /Observed symptoms selected: 1 of/iu);
  assert.match(report, /Account groups selected: 1 of/iu);
  assert.match(report, /counts only/iu);
  assert.match(report, /not proof of a SIM swap/iu);
  assert.match(report, /not .*guarantee/iu);
  assert.doesNotMatch(report, /Unexpected loss of mobile service/iu);
  assert.doesNotMatch(report, /Bank or card access/iu);
  assert.doesNotMatch(report, /Transaction alert, receipt, or statement/iu);
});

test("official references use only the approved Indian primary-source domains", () => {
  assert.ok(OFFICIAL_SOURCES.length >= 5);
  assert.ok(
    OFFICIAL_SOURCES.every((source) =>
      /(?:rbi\.org\.in|dot\.gov\.in|pib\.gov\.in|cybercrime\.gov\.in)/u.test(
        source.url,
      ),
    ),
  );
});

test("detects any local selection and creates a predictable filename", () => {
  const states = {
    symptoms: createSelectionState(OBSERVED_SYMPTOMS),
    accounts: createSelectionState(ACCOUNT_GROUPS),
    actions: createActionState(),
    evidence: createSelectionState(EVIDENCE_TYPES),
  };

  assert.equal(hasRecoverySelections(states), false);
  states.actions["evidence-originals"] = true;
  assert.equal(hasRecoverySelections(states), true);
  assert.equal(
    countsOnlyFilename(new Date("2026-07-24T10:15:00.000Z")),
    "sim-swap-recovery-counts-2026-07-24.txt",
  );
});

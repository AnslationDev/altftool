import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountsOnlyMandateReport,
  buildMandateIcs,
  escapeIcsText,
  foldIcsLine,
  OFFICIAL_REFERENCES,
  validateAndPlanMandate,
} from "./mandatePlanner.mjs";

function baseInput(overrides = {}) {
  return {
    merchant: "Example Subscription",
    amount: "499",
    frequency: "monthly",
    startDate: "2027-01-01",
    endDate: "2027-04-30",
    debitDay: "31",
    debitReminderDays: "2",
    ...overrides,
  };
}

test("monthly planner clamps missing debit days without drifting later months", () => {
  const plan = validateAndPlanMandate(baseInput());

  assert.equal(plan.valid, true);
  assert.deepEqual(
    plan.occurrences.map((occurrence) => occurrence.date),
    ["2027-01-31", "2027-02-28", "2027-03-31", "2027-04-30"],
  );
  assert.equal(plan.clampedMonths, 2);
  assert.ok(plan.warnings.some((warning) => /last calendar day/iu.test(warning)));
});

test("weekly and fortnightly schedules remain anchored to the start date", () => {
  const weekly = validateAndPlanMandate(
    baseInput({
      frequency: "weekly",
      startDate: "2027-01-05",
      endDate: "2027-01-26",
      debitDay: "",
    }),
  );
  const fortnightly = validateAndPlanMandate(
    baseInput({
      frequency: "fortnightly",
      startDate: "2027-01-05",
      endDate: "2027-02-03",
      debitDay: "",
    }),
  );

  assert.deepEqual(
    weekly.occurrences.map((occurrence) => occurrence.date),
    ["2027-01-05", "2027-01-12", "2027-01-19", "2027-01-26"],
  );
  assert.deepEqual(
    fortnightly.occurrences.map((occurrence) => occurrence.date),
    ["2027-01-05", "2027-01-19", "2027-02-02"],
  );
});

test("bi-monthly planner explicitly means every two months", () => {
  const plan = validateAndPlanMandate(
    baseInput({
      frequency: "bimonthly",
      startDate: "2027-01-10",
      endDate: "2027-07-10",
      debitDay: "10",
    }),
  );

  assert.equal(plan.frequency.label, "Every two months");
  assert.deepEqual(
    plan.occurrences.map((occurrence) => occurrence.date),
    ["2027-01-10", "2027-03-10", "2027-05-10", "2027-07-10"],
  );
});

test("rejects invalid amount, dates, date order, debit day, and lead time", () => {
  const plan = validateAndPlanMandate(
    baseInput({
      amount: "0",
      startDate: "2027-02-30",
      endDate: "2026-12-01",
      debitDay: "32",
      debitReminderDays: "2.5",
    }),
  );

  assert.equal(plan.valid, false);
  assert.ok(plan.errors.some((error) => /positive/iu.test(error)));
  assert.ok(plan.errors.some((error) => /start date/iu.test(error)));
  assert.ok(plan.errors.some((error) => /whole number/iu.test(error)));
});

test("adds pause and revoke review reminders with an out-of-range warning", () => {
  const plan = validateAndPlanMandate(
    baseInput({
      pauseReminderDate: "2027-03-01",
      revokeReminderDate: "2027-06-01",
    }),
  );

  assert.equal(plan.reminderEvents.length, 2);
  assert.ok(plan.warnings.some((warning) => /after the planned mandate end/iu.test(warning)));
});

test("ICS escapes text, adds tentative events and alarms, and cannot change a mandate", () => {
  const plan = validateAndPlanMandate(
    baseInput({
      merchant: "ACME, Media; Plan",
      frequency: "one-time",
      startDate: "2027-01-15",
      endDate: "2027-01-15",
      pauseReminderDate: "2027-01-10",
      includeAmountInCalendar: true,
    }),
  );
  const ics = buildMandateIcs(plan, {
    generatedAt: new Date("2026-07-24T10:00:00Z"),
  });
  const unfoldedIcs = ics.replace(/\r\n /gu, "");

  assert.match(ics, /BEGIN:VCALENDAR\r\n/u);
  assert.match(ics, /SUMMARY:Estimated UPI AutoPay debit — ACME\\, Media\\; Plan/u);
  assert.match(ics, /INR 499/u);
  assert.match(ics, /TRIGGER:-P2D/u);
  assert.match(ics, /STATUS:TENTATIVE/u);
  assert.match(unfoldedIcs, /cannot initiate\\, pause\\, or revoke a payment/iu);
  assert.equal((ics.match(/BEGIN:VEVENT/gu) || []).length, 2);
});

test("amount is omitted from ICS unless explicitly requested", () => {
  const plan = validateAndPlanMandate(
    baseInput({
      frequency: "one-time",
      startDate: "2027-01-15",
      endDate: "2027-01-15",
      includeAmountInCalendar: false,
    }),
  );
  const ics = buildMandateIcs(plan, {
    generatedAt: new Date("2026-07-24T10:00:00Z"),
  });

  assert.doesNotMatch(ics, /INR 499/u);
});

test("counts-only report excludes merchant, amount, and all dates", () => {
  const plan = validateAndPlanMandate(
    baseInput({
      merchant: "Private Merchant Name",
      amount: "9876.54",
      pauseReminderDate: "2027-03-01",
    }),
  );
  const report = buildCountsOnlyMandateReport(plan);

  assert.doesNotMatch(report, /Private Merchant|9876|2027-/u);
  assert.match(report, /excludes merchant name, amount, start date/iu);
  assert.match(report, /cannot create, approve, modify, pause/iu);
});

test("ICS text escaping and folding are UTF-8 safe", () => {
  assert.equal(escapeIcsText("a,b;c\\d\nx"), "a\\,b\\;c\\\\d\\nx");
  const folded = foldIcsLine(`SUMMARY:${"नमस्ते".repeat(20)}`);
  const lines = folded.split("\r\n");
  const encoder = new TextEncoder();

  assert.ok(lines.length > 1);
  assert.ok(lines.every((line) => encoder.encode(line).length <= 75));
  assert.ok(lines.slice(1).every((line) => line.startsWith(" ")));
});

test("official references stay on NPCI domains and include the accessed date", () => {
  assert.equal(OFFICIAL_REFERENCES.length >= 2, true);
  OFFICIAL_REFERENCES.forEach((reference) => {
    assert.equal(new URL(reference.url).hostname, "www.npci.org.in");
    assert.equal(reference.accessedOn, "2026-07-24");
  });
});

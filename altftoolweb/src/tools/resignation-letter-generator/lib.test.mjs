import assert from "node:assert/strict";
import test from "node:test";

import { buildResignationLetter } from "./lib.js";

const base = {
  employeeName: "Asha",
  designation: "Engineer",
  companyName: "Example Co",
  resignationDate: "2026-08-01",
  noticeDays: 30,
  toneId: "immediate",
};

test("early-release wording appears only when a real notice shortfall exists", () => {
  const fullNotice = buildResignationLetter(base);
  assert.doesNotMatch(fullNotice.letter, /released earlier/i);

  const early = buildResignationLetter({ ...base, proposedLastDay: "2026-08-15" });
  assert.equal((early.letter.match(/released earlier/gi) || []).length, 1);
  assert.equal((early.letter.match(/short of the full notice period/gi) || []).length, 1);
});

test("criticism screen includes handover notes", () => {
  const result = buildResignationLetter({
    ...base,
    toneId: "standard",
    handoverNotes: "the terrible process left by the team",
  });
  const item = result.checklist.find((entry) => entry.item.startsWith("No criticism"));
  assert.equal(item.done, false);
});

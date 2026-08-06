import assert from "node:assert/strict";
import test from "node:test";

import {
  CONCESSION_MODES,
  REQUEST_KINDS,
  buildFeeConcessionLetter,
  classifyRteClass,
  computeAffordability,
  computeConcession,
  computeFeeTotal,
} from "./lib.js";

function buildRteLetter(className, affordability = computeAffordability({ payable: 900, monthlyIncome: "1000" })) {
  const fee = computeFeeTotal({ tuition: 1000, transport: 0, activity: 0, exam: 0, other: 0 });
  const concession = computeConcession({
    total: fee.total,
    mode: CONCESSION_MODES.PERCENT,
    concessionPercent: 10,
    concessionAmount: 0,
    arrears: 0,
  });

  return buildFeeConcessionLetter({
    className,
    requestKind: REQUEST_KINDS.CONCESSION,
    groundId: "rte-category",
    letterDateISO: "2026-08-06",
    fee,
    concession,
    plan: null,
    affordability,
  });
}

test("blank or zero income stays optional but explicit invalid income is rejected", () => {
  assert.deepEqual(computeAffordability({ payable: 900, monthlyIncome: "" }), {
    annualIncome: 0,
    feeShare: null,
  });
  assert.deepEqual(computeAffordability({ payable: 900, monthlyIncome: "   " }), {
    annualIncome: 0,
    feeShare: null,
  });
  assert.deepEqual(computeAffordability({ payable: 900, monthlyIncome: 0 }), {
    annualIncome: 0,
    feeShare: null,
  });
  assert.match(computeAffordability({ payable: 900, monthlyIncome: -1 }).error, /cannot be negative/i);
  assert.match(
    computeAffordability({ payable: 900, monthlyIncome: "not-a-number" }).error,
    /valid number/i,
  );
});

test("letter generation propagates an affordability validation error", () => {
  const result = buildRteLetter("VIII", { error: "Income is invalid." });
  assert.equal(result.error, "Income is invalid.");
});

test("common post-elementary class labels never receive the elementary entitlement paragraph", () => {
  for (const className of ["IX-A", "Class 10-B", "9 A", "Class XII / Science"]) {
    assert.equal(classifyRteClass(className), "post-elementary");
    const letter = buildRteLetter(className);
    assert.match(letter.body, /does not claim an RTE fee entitlement/i);
    assert.doesNotMatch(letter.body, /Section 3\(2\) protects a covered child/i);
  }
});

test("uncertain and pre-primary labels use conditional guidance", () => {
  assert.equal(classifyRteClass("Class Nursery-A"), "pre-primary");
  assert.match(buildRteLetter("Class Nursery-A").body, /where the school imparts pre-school/i);
  assert.equal(classifyRteClass("Senior school"), "unknown");
  assert.match(buildRteLetter("Senior school").body, /class or entry level is not clear/i);
});

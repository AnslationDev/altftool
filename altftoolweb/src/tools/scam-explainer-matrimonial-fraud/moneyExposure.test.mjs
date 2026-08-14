import assert from "node:assert/strict";
import test from "node:test";

import { assess, describeAmountIssue, exposureTotal } from "./lib.js";

test("blank transfer rows are unfinished inputs, not zero-value transfers", () => {
  assert.deepEqual(exposureTotal(["", "   ", null, undefined]), {
    total: 0,
    count: 0,
    largest: 0,
    invalidCount: 0,
  });
});

test("invalid or unsafe transfer values are excluded and reported", () => {
  assert.deepEqual(exposureTotal(["100", "-1", "1e309"]), {
    total: 100,
    count: 1,
    largest: 100,
    invalidCount: 2,
  });
  assert.match(describeAmountIssue(String(Number.MAX_SAFE_INTEGER + 1)), /too large/);
  assert.match(describeAmountIssue("1.5"), /whole-INR/);
});

test("individually safe transfers cannot overflow the aggregate", () => {
  assert.deepEqual(exposureTotal([String(Number.MAX_SAFE_INTEGER), "1"]), {
    total: Number.MAX_SAFE_INTEGER,
    count: 1,
    largest: Number.MAX_SAFE_INTEGER,
    invalidCount: 1,
  });
});

test("money already sent forces the stop verdict without a separate money flag", () => {
  const result = assess({ flagIds: [], verifiedIds: [], amountsSent: ["100"] });
  assert.equal(result.moneyLayer, true);
  assert.equal(result.verdict.id, "stop");
  assert.equal(result.exposure.total, 100);
});

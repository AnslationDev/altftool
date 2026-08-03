import test from "node:test";
import assert from "node:assert/strict";

import { BUDGET_MODELS, allocateBudget, buildWeddingPrompt } from "./lib.js";

test("every wedding allocation reconciles to its displayed total", () => {
  for (const model of BUDGET_MODELS) {
    for (const total of [1, 99, 101, 999_999, 1_000_001.4]) {
      const allocation = allocateBudget(total, model.id);
      assert.equal(
        allocation.rows.reduce((sum, row) => sum + row.amount, 0),
        Math.round(total),
      );
    }
  }
});

test("committed spend plus contingency equals the returned total", () => {
  const result = buildWeddingPrompt({
    totalBudget: 1_000_001.4,
    guests: 100,
    monthsToGo: 6,
    model: "multi-event",
  });

  assert.equal(result.error, undefined);
  assert.equal(result.total, 1_000_001);
  assert.equal(result.spendableTotal + result.contingencyAmount, result.total);
  assert.equal(result.rows.reduce((sum, row) => sum + row.amount, 0), result.total);
});

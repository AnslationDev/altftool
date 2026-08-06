import assert from "node:assert/strict";
import test from "node:test";

import { ASSUMPTIONS_BASELINE, planPestControl } from "./lib.js";

test("multi-round bed-bug work separates cycle starts from technician visits", () => {
  const plan = planPestControl({
    areaSqft: 1000,
    pests: ["bedbug"],
    includeGst: false,
    startMonth: 0,
  });

  assert.equal(plan.error, undefined);
  assert.equal(plan.assumptionsBaseline, ASSUMPTIONS_BASELINE);
  assert.equal(plan.rows[0].dueMonths.length, 2);
  assert.equal(plan.visitsInPlan, 4);
  assert.deepEqual(
    plan.calendar.filter((entry) => entry.treatments.length > 0).map((entry) => entry.visits),
    [2, 2],
  );
});

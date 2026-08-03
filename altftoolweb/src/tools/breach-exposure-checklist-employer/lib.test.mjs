import test from "node:test";
import assert from "node:assert/strict";

import { CHECKLIST, assessResponse, breachSeverity } from "./lib.js";

test("breach output describes checklist progress without claiming protection", () => {
  const classIds = ["identifiers", "nationalId", "payrollBank"];
  const result = assessResponse({
    classIds,
    doneIds: CHECKLIST.map((item) => item.id),
  });

  assert.equal(result.percent, 100);
  assert.doesNotMatch(result.bandHint, /every path|risk removed|fully exploitable/i);
  assert.match(result.bandHint, /verify|monitor/i);
});

test("data sensitivity wording remains probabilistic", () => {
  const result = breachSeverity(["nationalId", "payrollBank", "health"]);
  assert.equal(result.error, undefined);
  assert.doesNotMatch(result.tierHint, /will|enough for/i);
  assert.match(result.tierHint, /may|can|relevant/i);
});

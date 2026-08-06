import assert from "node:assert/strict";
import test from "node:test";

import { scoreSscAttempt } from "./lib.js";

test("completed-attempt scoring rejects fractional answer counts", () => {
  assert.match(
    scoreSscAttempt({ examKey: "cgl-tier1", correct: 1.4, wrong: 2 }).error,
    /whole numbers/i,
  );
  assert.match(
    scoreSscAttempt({ examKey: "cgl-tier1", correct: 1, wrong: 2.4 }).error,
    /whole numbers/i,
  );
});

test("completed-attempt scoring keeps valid integer counts exact", () => {
  const result = scoreSscAttempt({ examKey: "cgl-tier1", correct: 62, wrong: 18 });
  assert.equal(result.attempted, 80);
  assert.equal(result.unattempted, 20);
  assert.equal(result.net, 115);
});
